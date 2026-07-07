"use client";

import { useStore } from "@/lib/store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building, Globe, User, UploadCloud, FileText, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

const auditSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  websiteUrl: z.string().url("Must be a valid URL"),
  industry: z.string().min(2, "Industry is required"),
  primaryService: z.enum(["SEO", "SEM", "CRO", "Analytics", "Full Search Marketing"]),
  preparedBy: z.string().min(2, "Author name is required"),
  date: z.string().min(1, "Date is required"),
  clientLogoUrl: z.string().optional(),
  notes: z.string().optional(),
});

type AuditFormValues = z.infer<typeof auditSchema>;

export default function NewAuditPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading workspace...</p></div>}>
      <NewAuditForm />
    </Suspense>
  );
}

function NewAuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const audits = useStore((state) => state.audits);
  const createAudit = useStore((state) => state.createAudit);
  const cloneAudit = useStore((state) => state.cloneAudit);
  const updateAudit = useStore((state) => state.updateAudit);
  
  const template = templateId ? audits[templateId] : null;
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AuditFormValues>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      primaryService: "Full Search Marketing"
    }
  });

  const [useBulkImport, setUseBulkImport] = useState(false);
  const [bulkNotes, setBulkNotes] = useState("");
  const [bulkImages, setBulkImages] = useState<File[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleBulkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBulkImages(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: AuditFormValues) => {
    setIsProcessingBulk(true);
    const payload: any = { ...data };
    
    // Migrate the uploaded logo to the new interactive coverLogos array
    if (payload.clientLogoUrl) {
      payload.coverLogos = [{
        id: crypto.randomUUID(),
        url: payload.clientLogoUrl,
        x: 400,
        y: 100,
        width: 30
      }];
      delete payload.clientLogoUrl;
    }

    let targetAuditId: string | undefined;

    if (templateId && template) {
      // 1. Clone the template to create a new audit
      targetAuditId = cloneAudit(templateId) || undefined;
      if (targetAuditId) {
        // 2. Update the cloned audit with the new client's data
        updateAudit(targetAuditId, {
          companyName: payload.companyName,
          websiteUrl: payload.websiteUrl,
          industry: payload.industry,
          primaryService: payload.primaryService,
          preparedBy: payload.preparedBy,
          date: payload.date,
          coverLogos: payload.coverLogos,
          isTemplate: false // Ensure the clone is NOT a template
        });
      }
    } else {
      // Create a blank audit
      targetAuditId = createAudit(payload);
    }

    if (!targetAuditId) {
      setIsProcessingBulk(false);
      return;
    }

    // Handle Bulk Findings if enabled
    if (useBulkImport && bulkNotes.trim() && bulkImages.length > 0) {
      try {
        // 1. Upload all files to Supabase mapped by original name
        const uploadedImagesMap: Record<string, string> = {};
        await Promise.all(bulkImages.map(async (file) => {
          try {
            const ext = file.name.split('.').pop() || 'png';
            const filename = `${crypto.randomUUID()}.${ext}`;
            
            const { error } = await supabase.storage
              .from("audit-images")
              .upload(filename, file, {
                upsert: false
              });
            
            if (error) throw error;
            
            const { data: publicUrlData } = supabase.storage
              .from("audit-images")
              .getPublicUrl(filename);
            
            if (publicUrlData.publicUrl) {
              uploadedImagesMap[file.name] = publicUrlData.publicUrl;
            }
          } catch (err) {
            console.error(`Failed to upload ${file.name}`, err);
          }
        }));

        // 2. Call the AI endpoint
        const aiResponse = await fetch('/audits/api/ai/bulk-findings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: bulkNotes,
            imageFilenames: bulkImages.map(f => f.name),
            companyName: payload.companyName,
            industry: payload.industry
          })
        });

        if (!aiResponse.ok) {
          const errData = await aiResponse.json().catch(() => ({}));
          console.error("Failed to generate bulk findings", errData);
          alert("Bulk Import Error: " + (errData.details || errData.error || "Unknown error generating findings."));
          setIsProcessingBulk(false);
          return; // Stop the flow if AI fails so they don't get routed to a blank audit
        } else {
          // If we are cloning a template AND importing bulk findings, delete the template's placeholder findings
          if (templateId) {
             const allFindings = useStore.getState().findings;
             const removeFinding = useStore.getState().removeFinding;
             const findingsToDelete = Object.values(allFindings).filter((f: any) => f.auditId === targetAuditId);
             findingsToDelete.forEach((f: any) => removeFinding(f.id));
          }

          const { findings } = await aiResponse.json();
          
          // 3. Process the results into the store
          const addFinding = useStore.getState().addFinding;
          const updateReportStructure = useStore.getState().updateReportStructure;
          const currentStructure = useStore.getState().audits[targetAuditId]?.reportStructure || {};
          
          let currentCustomStages = currentStructure.customStages ? [...currentStructure.customStages] : [];
          let currentStageConfigs = currentStructure.stageConfigs ? { ...currentStructure.stageConfigs } : {};
          
          // If cloning a template, wipe its existing stages so the new AI stages take over the sidebar cleanly
          if (templateId) {
            currentCustomStages = [];
            currentStageConfigs = {};
          }
          
          const stageCounts: Record<string, number> = {};
          const stageThemeMap: Record<string, "light" | "dark"> = {};
          let nextStageTheme: "light" | "dark" = "dark"; // Start with dark mode for the first section

          findings.forEach((f: any) => {
            // Extract the Supabase URL if a valid filename was matched
            const matchedImagesUrls = (f.matchedFilenames || []).map((filename: string) => uploadedImagesMap[filename]).filter(Boolean);

            // Ensure the stage exists in customStages if it's not a standard one
            const standardStages = ["Awareness", "Consideration", "Conversion", "Technical", "UX"];
            if (!standardStages.includes(f.stage) && !currentCustomStages.includes(f.stage)) {
              currentCustomStages.push(f.stage);
            }

            // Save the stage subheading if the AI provided one
            if (f.stageHeading && !currentStageConfigs[f.stage]) {
              currentStageConfigs[f.stage] = { 
                ...currentStageConfigs[f.stage],
                heading: f.stageHeading 
              };
            }

            // Track finding index per stage to ensure perfect 2-per-page layouts
            if (!stageCounts[f.stage]) stageCounts[f.stage] = 0;
            const stageIndex = stageCounts[f.stage];
            stageCounts[f.stage]++;

            // Assign a consistent theme per stage, alternating between stages
            if (!stageThemeMap[f.stage]) {
              stageThemeMap[f.stage] = nextStageTheme;
              nextStageTheme = nextStageTheme === "light" ? "dark" : "light";
            }

            // Insert a standalone page break finding if needed
            const isImageLeft = stageIndex % 2 === 0;
            const needsPageBreak = isImageLeft && stageIndex > 0;
            
            if (needsPageBreak) {
              const pbId = crypto.randomUUID();
              addFinding(targetAuditId, {
                title: "--- Page Break ---",
                rawNotes: "",
                stage: f.stage,
                category: "Layout",
                severity: "Low",
                layoutType: "legacy-box-left",
                isPageBreak: true
              });
            }

            // Generate dynamic overlapping editorial layouts
            const imgWidth = Math.floor(Math.random() * (75 - 60 + 1)) + 60; // 60% to 75%
            const boxWidth = Math.floor(Math.random() * (50 - 40 + 1)) + 40; // 40% to 50%
            
            // Box vertical offset to break the top alignment
            const boxVerticalOffset = Math.floor(Math.random() * (80 - 20 + 1)) + 20; 
            
            // Image vertical offset to occasionally push the image down
            const imgVerticalOffset = Math.floor(Math.random() * 30);

            // Horizontal offsets to randomly push elements closer or further apart
            const imgHorizontalOffset = isImageLeft ? Math.floor(Math.random() * 30) : -Math.floor(Math.random() * 30);
            const boxHorizontalOffset = isImageLeft ? -Math.floor(Math.random() * 40) : Math.floor(Math.random() * 40);

            addFinding(targetAuditId, {
              title: f.title,
              rawNotes: f.rawNotes || "",
              polishedTitle: f.title,
              stage: f.stage,
              category: f.category || "General",
              severity: f.severity || "Medium",
              layoutType: isImageLeft ? "image-left" : "image-right",
              boxColor: stageThemeMap[f.stage],
              imageUrls: matchedImagesUrls.length > 0 ? matchedImagesUrls : undefined,
              imageUrl: matchedImagesUrls.length > 0 ? matchedImagesUrls[0] : undefined,
              imageWidth: imgWidth,
              boxWidth: boxWidth,
              verticalOffset: boxVerticalOffset,
              imageVerticalOffset: imgVerticalOffset,
              imageHorizontalOffset: imgHorizontalOffset,
              horizontalOffset: boxHorizontalOffset
            });
          });

          updateReportStructure(targetAuditId, { 
            customStages: currentCustomStages,
            stageConfigs: currentStageConfigs
          });
        }
      } catch (error) {
        console.error("Bulk import error:", error);
      }
    }

    router.push(`/${targetAuditId}/edit`);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      try {
        const ext = file.name.split('.').pop() || 'png';
        const filename = `${crypto.randomUUID()}.${ext}`;
        
        const { error } = await supabase.storage
          .from("audit-images")
          .upload(filename, file, { upsert: false });
        
        if (error) throw error;
        
        const { data } = supabase.storage.from("audit-images").getPublicUrl(filename);
        if (data.publicUrl) {
          setValue("clientLogoUrl", data.publicUrl);
        }
      } catch (err) {
        console.error("Failed to upload logo", err);
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
      <div className="w-full max-w-4xl m-auto flex flex-col gap-4 py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {template ? "Create from Template" : "Create New Audit"}
          </h1>
          <p className="text-muted-foreground mt-2 font-serif text-lg">
            {template 
              ? `Initialize a new workspace based on "${template.companyName}". Enter the new client information below.`
              : "Initialize a new strategic reporting workspace. Enter the baseline client information to get started."}
          </p>
        </div>

        <GlassPanel className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4" /> Company Name
                </label>
                <input 
                  {...register("companyName")}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Acme Corp"
                />
                {errors.companyName && <span className="text-destructive text-sm">{errors.companyName.message}</span>}
              </div>

              {/* Client Logo */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client Logo (Optional)
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer"
                />
              </div>

              {/* Website URL */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website URL
                </label>
                <input 
                  {...register("websiteUrl")}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="https://example.com"
                />
                {errors.websiteUrl && <span className="text-destructive text-sm">{errors.websiteUrl.message}</span>}
              </div>
              
              {/* Industry */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Industry
                </label>
                <input 
                  {...register("industry")}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. SaaS, E-commerce"
                />
                {errors.industry && <span className="text-destructive text-sm">{errors.industry.message}</span>}
              </div>

              {/* Primary Service */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Primary Service
                </label>
                <select 
                  {...register("primaryService")}
                  className="w-full bg-[#151515] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="SEO">SEO</option>
                  <option value="SEM">SEM</option>
                  <option value="CRO">CRO</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Full Search Marketing">Full Search Marketing</option>
                </select>
              </div>

              {/* Prepared By */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Prepared By
                </label>
                <input 
                  {...register("preparedBy")}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Strategist Name"
                />
                {errors.preparedBy && <span className="text-destructive text-sm">{errors.preparedBy.message}</span>}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Presentation Date
                </label>
                <input 
                  type="date"
                  {...register("date")}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

{/* Bulk Import Section */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex flex-col items-start gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-indigo-400" />
                    Bulk Import Findings
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload screenshots and paste raw notes. AI will match them and build out the audit pages automatically.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={useBulkImport ? "default" : "secondary"}
                  onClick={() => setUseBulkImport(!useBulkImport)}
                  className={`rounded-full ${useBulkImport ? 'bg-indigo-500 hover:bg-indigo-600' : ''}`}
                >
                  {useBulkImport ? 'Disable' : 'Enable'}
                </Button>
              </div>

              {useBulkImport && (
                <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-xl border border-white/5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Finding Images
                    </label>
                    <div className="relative border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group">
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleBulkImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Drop images here"
                      />
                      <UploadCloud className="w-8 h-8 text-indigo-400/70 group-hover:text-indigo-400 mb-3 transition-colors" />
                      <p className="text-sm text-white font-medium">Click or drag images here</p>
                      <p className="text-xs text-muted-foreground mt-1">Select up to 50 screenshots</p>
                      <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md px-4 py-2.5 max-w-[90%]">
                        <p className="text-[11px] text-indigo-300/90 leading-relaxed font-medium">
                          <span className="font-bold text-indigo-400">Note:</span> Ensure your image filenames are relevant to their respective notes so the AI can accurately match them together.
                        </p>
                      </div>
                      
                      {bulkImages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10 w-full">
                          <p className="text-sm text-indigo-300 font-semibold">{bulkImages.length} images ready to process</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Raw Notes
                    </label>
                    <textarea 
                      value={bulkNotes}
                      onChange={(e) => setBulkNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-32 resize-none"
                      placeholder="Paste your raw bullet points here. The AI will read these, extract the intent, and match them with the most logically relevant image you uploaded."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-white/10">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.push('/dashboard')} 
                className="rounded-full h-12 px-8 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessingBulk || isUploadingLogo}
                className="bg-gradient-primary hover:opacity-90 rounded-full h-12 px-8 shadow-lg shadow-indigo-500/20 text-white font-semibold min-w-[200px]"
              >
                {isProcessingBulk ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Audit...
                  </>
                ) : isUploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading Logo...
                  </>
                ) : (
                  <>
                    Initialize Workspace <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
