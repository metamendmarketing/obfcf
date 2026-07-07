import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Finding, useStore } from "@/lib/store";
import { ChevronDown, ChevronRight } from "lucide-react";
import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/button";
import { RichTextEditor } from "../ui/RichTextEditor";
import { compressImage } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface FindingEntryFormProps {
  findingId: string;
}

export function FindingEntryForm({ findingId }: FindingEntryFormProps) {
  const [isStageSettingsOpen, setIsStageSettingsOpen] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const finding = useStore((state) => state.findings[findingId]);
  const updateFinding = useStore((state) => state.updateFinding);

  const { register, handleSubmit, setValue, getValues, watch, control } = useForm<Partial<Finding>>({
    values: finding,
  });

  const currentImageUrls = watch("imageUrls") || (finding.imageUrl ? [finding.imageUrl] : []);

  if (!finding) return null;

  const auditId = finding.auditId;
  const audit = useStore.getState().audits[auditId];
  const standardStages = ["Awareness", "Consideration", "Conversion", "Technical", "UX"];
  const customStages = audit?.reportStructure?.customStages || [];
  const findingStages = Object.values(useStore.getState().findings).filter(f => f.auditId === auditId).map(f => f.stage);
  const allStages = Array.from(new Set([...standardStages, ...customStages, ...findingStages]));

  const onSubmit = (data: Partial<Finding>) => {
    const updates: Partial<Finding> = { ...data };
    if (data.title !== undefined) {
      updates.polishedTitle = data.title;
    }
    if (data.rawNotes !== undefined) {
      updates.polishedBody = "";
    }
    updateFinding(findingId, updates);
  };

  // Trigger auto-save when blur
  const onBlur = handleSubmit(onSubmit);

  const handlePolish = async (wordLimit: number) => {
    const currentNotes = getValues("rawNotes");
    
    if (!currentNotes || currentNotes.trim() === "") {
      alert("Please enter raw notes before polishing.");
      return;
    }
    
    setIsPolishing(true);
    try {
      const res = await fetch("/audits/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawNotes: currentNotes,
          category: finding.category,
          stage: finding.stage,
          imageUrls: currentImageUrls,
          wordLimit: wordLimit > 0 ? wordLimit : undefined
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        const newRawNotes = data.polishedBody || '';
        
        setValue("rawNotes", newRawNotes);
        if (data.polishedTitle) setValue("title", data.polishedTitle);
        if (data.businessImpact) setValue("businessImpact", data.businessImpact);
        if (data.recommendation) setValue("recommendation", data.recommendation);

        updateFinding(findingId, {
          title: data.polishedTitle || finding.title,
          rawNotes: newRawNotes,
          polishedSummary: "",
          polishedBody: "",
          businessImpact: data.businessImpact,
          recommendation: data.recommendation,
          status: "Polished"
        });
      } else {
        let errMsg = "Failed to polish finding.";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg += ` Reason: ${errData.error}`;
          }
        } catch (_) {}
        alert(errMsg);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during polishing.");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <form className="flex flex-col gap-8" onBlur={onBlur}>
      {/* Stage Group */}
      <div className="bg-white/5 border border-white/10 p-2 rounded-lg flex flex-col mb-4">
        <button 
          type="button"
          onClick={() => setIsStageSettingsOpen(!isStageSettingsOpen)}
          className="w-full flex items-center justify-between hover:bg-white/5 p-2 rounded transition-colors group"
        >
          <div className="flex flex-col items-start">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Stage: {finding.stage}
            </h3>
            <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors text-left mt-1">Configure section assignment, heading, and caption</p>
          </div>
          <div className="text-white/40 group-hover:text-white/80 transition-colors pr-2">
            {isStageSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>
        
        {isStageSettingsOpen && (
          <div className="flex flex-col gap-4 mt-2 border-t border-white/10 pt-4 px-2 pb-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Stage Assignment
              </label>
              <input 
                list="stages-datalist"
                {...register("stage", {
                  onChange: (e) => updateFinding(findingId, { stage: e.target.value })
                })}
                placeholder="Type new stage or select..."
                className="w-full bg-[#151515] border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <datalist id="stages-datalist">
                {allStages.map(stage => (
                  <option key={stage} value={stage} />
                ))}
              </datalist>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Stage Custom Heading
                </label>
                <input 
                  value={audit?.reportStructure?.stageConfigs?.[finding.stage]?.heading || ""}
                  onChange={(e) => {
                    if (!audit) return;
                    const currentConfigs = audit.reportStructure?.stageConfigs || {};
                    useStore.getState().updateAudit(auditId, {
                      reportStructure: {
                        ...audit.reportStructure,
                        stageConfigs: {
                          ...currentConfigs,
                          [finding.stage]: {
                            ...currentConfigs[finding.stage],
                            heading: e.target.value
                          }
                        }
                      }
                    });
                  }}
                  placeholder="e.g. The Visibility Crisis"
                  className="w-full bg-[#151515] border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Stage Caption (Optional)
                </label>
                <textarea 
                  value={audit?.reportStructure?.stageConfigs?.[finding.stage]?.caption || ""}
                  onChange={(e) => {
                    if (!audit) return;
                    const currentConfigs = audit.reportStructure?.stageConfigs || {};
                    useStore.getState().updateAudit(auditId, {
                      reportStructure: {
                        ...audit.reportStructure,
                        stageConfigs: {
                          ...currentConfigs,
                          [finding.stage]: {
                            ...currentConfigs[finding.stage],
                            caption: e.target.value
                          }
                        }
                      }
                    });
                  }}
                  placeholder="e.g. Getting titles right is foundational..."
                  className="w-full bg-[#151515] border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Finding Title
        </label>
        <input 
          {...register("title", {
            onChange: (e) => updateFinding(findingId, { title: e.target.value, polishedTitle: e.target.value })
          })}
          placeholder="e.g. Broken Canonical Tags on Category Pages"
          className="text-2xl font-bold bg-transparent border-b border-white/10 pb-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </label>
          <select 
            value={finding.category || "Technical SEO"}
            onChange={(e) => updateFinding(findingId, { category: e.target.value })}
            className="w-full bg-[#151515] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
          >
            <option value="Technical SEO">Technical SEO</option>
            <option value="Architecture">Architecture</option>
            <option value="Indexing">Indexing</option>
            <option value="Performance">Performance</option>
            <option value="CRO">CRO</option>
            <option value="Conversion">Conversion</option>
            <option value="Trust">Trust</option>
            <option value="UX">UX</option>
            <option value="UX/UI">UX/UI</option>
            <option value="Content">Content</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Severity
          </label>
          <select 
            value={finding.severity || "Medium"}
            onChange={(e) => updateFinding(findingId, { severity: e.target.value as any })}
            className="w-full bg-[#151515] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Opportunity">Opportunity</option>
          </select>
        </div>





      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Box Theme
          </label>
          <select 
            value={finding.boxColor || 'dark'}
            onChange={(e) => updateFinding(findingId, { boxColor: e.target.value as any })}
            className="w-full bg-[#151515] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
          >
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
          </select>
        </div>
      </div>
      


      <div className="flex flex-col gap-4">
        <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          Content
        </label>
        <Controller
          control={control}
          name="rawNotes"
          render={({ field }) => (
            <div className="w-full bg-white/5 border border-white/10 rounded-md overflow-hidden focus-within:border-indigo-500 transition-all">
              <RichTextEditor 
                value={field.value || ""} 
                onChange={(val) => {
                  field.onChange(val);
                  updateFinding(findingId, { rawNotes: val, polishedBody: "" });
                }} 
                minHeight="300px"
                onPolish={handlePolish}
                isPolishing={isPolishing}
              />
            </div>
          )}
        />
      </div>

      {/* Floating Table Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Floating Table / Canvas Text</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-3 h-3 accent-indigo-500 rounded bg-black/40 border-white/20"
              checked={finding.showTable || false}
              onChange={(e) => updateFinding(findingId, { showTable: e.target.checked })}
            />
            <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Show on Canvas</span>
          </label>
        </div>
        {finding.showTable && (
          <Controller
            control={control}
            name="tableContent"
            render={({ field }) => (
              <RichTextEditor 
                value={field.value || ""} 
                onChange={(val) => {
                  field.onChange(val);
                  updateFinding(findingId, { tableContent: val });
                }}
                minHeight="150px"
              />
            )}
          />
        )}
      </div>


      <div className="flex flex-col pt-6 border-t border-white/10 mt-2">
        <button 
          type="button"
          onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
          className="flex items-center gap-2 group w-max"
        >
          {isInsightsExpanded ? (
            <ChevronDown size={16} className="text-white/50 group-hover:text-white transition-colors" />
          ) : (
            <ChevronRight size={16} className="text-white/50 group-hover:text-white transition-colors" />
          )}
          <h4 className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">AI Strategic Insights</h4>
        </button>
        
        {isInsightsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-amber-400">Business Impact</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3 accent-indigo-500 rounded bg-black/40 border-white/20"
                    checked={finding.showBusinessImpact || false}
                    onChange={(e) => updateFinding(findingId, { showBusinessImpact: e.target.checked })}
                  />
                  <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Show on Canvas</span>
                </label>
              </div>
              <Controller
                control={control}
                name="businessImpact"
                render={({ field }) => (
                  <RichTextEditor 
                    value={field.value || ""} 
                    onChange={(val) => {
                      field.onChange(val);
                      updateFinding(findingId, { businessImpact: val });
                    }}
                    minHeight="100px"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-emerald-400">Recommendation</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3 accent-indigo-500 rounded bg-black/40 border-white/20"
                    checked={finding.showRecommendation || false}
                    onChange={(e) => updateFinding(findingId, { showRecommendation: e.target.checked })}
                  />
                  <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Show on Canvas</span>
                </label>
              </div>
              <Controller
                control={control}
                name="recommendation"
                render={({ field }) => (
                  <RichTextEditor 
                    value={field.value || ""} 
                    onChange={(val) => {
                      field.onChange(val);
                      updateFinding(findingId, { recommendation: val });
                    }}
                    minHeight="100px"
                  />
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Multi-Image Upload */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Evidence Screenshots
          </label>
          <button 
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all image and box positions to their default layout?")) {
                updateFinding(findingId, {
                  horizontalOffset: 0,
                  verticalOffset: undefined,
                  imageHorizontalOffset: 0,
                  imageVerticalOffset: 0,
                  image2HorizontalOffset: 0,
                  image2VerticalOffset: 0,
                  businessImpactHorizontalOffset: 0,
                  businessImpactVerticalOffset: 0,
                  recommendationHorizontalOffset: 0,
                  recommendationVerticalOffset: 0,
                  tableHorizontalOffset: 0,
                  tableVerticalOffset: 0,
                  boxWidth: undefined,
                  imageWidth: undefined,
                  image2Width: undefined,
                  businessImpactWidth: undefined,
                  recommendationWidth: undefined,
                  tableWidth: undefined,
                });
              }
            }}
            className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2 py-1 rounded transition-colors font-bold uppercase tracking-wider"
          >
            Reset Image Positions
          </button>
        </div>
        
        {currentImageUrls.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {currentImageUrls.map((img, idx) => (
              <div key={idx} className="relative rounded-md overflow-hidden border border-white/10 group min-w-[200px] h-32 flex-shrink-0">
                <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <div className="relative">
                    <Button variant="secondary" size="sm" onClick={(e) => e.preventDefault()}>
                      Replace
                    </Button>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const localUrl = URL.createObjectURL(file);
                            
                            // Optimistically update the UI instantly
                            const optimisticUrls = [...currentImageUrls];
                            optimisticUrls[idx] = localUrl;
                            setValue("imageUrls", optimisticUrls);
                            setValue("imageUrl", optimisticUrls[0] || "");
                            updateFinding(findingId, { imageUrls: optimisticUrls, imageUrl: optimisticUrls[0] || "" });

                            const ext = file.name.split('.').pop() || 'png';
                            const filename = `${crypto.randomUUID()}.${ext}`;
                            
                            const { data, error } = await supabase.storage
                              .from("audit-images")
                              .upload(filename, file, {
                                upsert: false
                              });
                            
                            if (error) throw error;
                            
                            const { data: publicUrlData } = supabase.storage
                              .from("audit-images")
                              .getPublicUrl(filename);
                            
                            const url = publicUrlData.publicUrl;
                            
                            if (url) {
                              const newUrls = [...currentImageUrls];
                              newUrls[idx] = url;
                              setValue("imageUrls", newUrls);
                              setValue("imageUrl", newUrls[0] || "");
                              updateFinding(findingId, { imageUrls: newUrls, imageUrl: newUrls[0] || "" });
                            }
                          } catch (err) {
                            console.error("Failed to upload replacement finding image", err);
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      const newUrls = currentImageUrls.filter((_, i) => i !== idx);
                      setValue("imageUrls", newUrls);
                      setValue("imageUrl", newUrls[0] || "");
                      updateFinding(findingId, { imageUrls: newUrls, imageUrl: newUrls[0] || "" });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="border-2 border-dashed border-white/20 rounded-md h-32 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative mt-2">
          <span className="text-muted-foreground text-sm font-medium">Click or Drag to upload screenshots</span>
          <input 
            type="file" 
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                const newUrls = [...currentImageUrls];
                
                // Optimistically show all images instantly
                const optimisticUrls = [...newUrls];
                for (const file of files) {
                  optimisticUrls.push(URL.createObjectURL(file));
                }
                setValue("imageUrls", optimisticUrls);
                setValue("imageUrl", optimisticUrls[0]);
                updateFinding(findingId, { imageUrls: optimisticUrls, imageUrl: optimisticUrls[0] });

                // Process real uploads in background
                for (const file of files) {
                  try {
                    const ext = file.name.split('.').pop() || 'png';
                    const filename = `${crypto.randomUUID()}.${ext}`;
                    
                    const { data, error } = await supabase.storage
                      .from("audit-images")
                      .upload(filename, file, {
                        upsert: false
                      });
                    
                    if (error) throw error;
                    
                    const { data: publicUrlData } = supabase.storage
                      .from("audit-images")
                      .getPublicUrl(filename);
                    
                    const url = publicUrlData.publicUrl;
                    if (url) {
                      newUrls.push(url);
                    }
                  } catch (err) {
                    console.error("Failed to upload finding image", err);
                  }
                }
                
                // Final update with cloud URLs
                setValue("imageUrls", newUrls);
                setValue("imageUrl", newUrls[0]);
                updateFinding(findingId, { imageUrls: newUrls, imageUrl: newUrls[0] });
              }
            }}
          />
        </label>
      </div>
    </form>
  );
}
