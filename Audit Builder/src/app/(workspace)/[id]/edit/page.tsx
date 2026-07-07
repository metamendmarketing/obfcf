"use client";

import { useStore } from "@/lib/store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { PlusCircle, LayoutTemplate, Layers, ChevronLeft, ChevronRight, MousePointer2, Square, ArrowUpRight, RotateCcw } from "lucide-react";
import { GradientText } from "@/components/ui/GradientText";
import { FindingEntryForm } from "@/components/audit/FindingEntryForm";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { LivePreview } from "@/components/audit/LivePreview";
import { SortablePagesList } from "@/components/audit/SidebarSortables";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { DEFAULT_CONCLUSION } from "@/lib/constants";
import { compressImage } from "@/lib/utils";

const DEFAULT_SEO_ONBOARDING = `<ol>
<li><p><strong>Client Insights</strong></p><p>The first step in our onboarding process is to gather important information with our questionnaire. This helps ensure we have sufficient access and will allow us to better understand your unique digital marketing goals.</p></li>
<li><p><strong>Quick Win Audit</strong></p><p>The next critical step is to create an audit of your current SEO strategy/website and identify all of the quick-win opportunities that will drive the highest ROI. For example, helping you optimize redirects, and backlinks between your different web properties, as well as consolidating domain authority and site equity. Fixing high priority issues and taking advantage of low hanging fruit opportunities will serve as the basis for our SEO strategy during the setup process. This quick win audit will expand upon the audit contained within this proposal and rank the opportunities by their level of priority.</p></li>
<li><p><strong>Keyword Research</strong></p><p>Keyword research is a core part of our onboarding and the foundation of your on-page SEO strategy. We build a complete keyword set with search volume and buyer-stage insights to target relevant terms and improve SERP rankings. Our team casts a wide net using your existing data and new research on industry user intent, then organizes keywords into clear groups by product or solution. These groups are mapped to the right pages and implemented across key elements like title tags.</p></li>
<li><p><strong>Initial Conversion Tracking, Analytics, and GTM Setup</strong></p><p>The final component of our onboarding process is to implement conversion tracking on your site. Our team will leverage Google Tag Manager along with Google Analytics to accurately track user engagement across your site, and ensure this data is captured and accessible. This data will be valuable for measuring your progress and implementing conversion optimization. By the end of this process, we will have:</p><ul><li>Identified main user flows throughout your site and drop-off points.</li><li>Identified all digital brand touchpoints, conversion points and lead magnets.</li><li>Set up conversion tracking and for all valuable website interactions.</li><li>Implemented conversion values to differentiate lower value conversions (like downloading whitepapers) from high value conversions (like booking a meeting or purchasing).</li></ul></li>
<li><p><strong>Reporting</strong></p><p>Our main reporting tool will be DashThis; however, we will leverage data and infographics from other platforms, such as Google Analytics, to create slide decks for weekly, monthly, and quarterly reporting. Aside from tracking and measuring everything, our reporting is also paramount for showcasing the growth and progress we are making together. When your high priority keyword rankings are improving, we want to be the first to let you know!</p><p>Step one will be to create a custom dashboard to monitor KPIs relating to user volume, engagement, and conversions. Our reporting makes big data digestible, and we are always ready to interpret data and make recommendations for future strategy based on our analysis. Learn more about DashThis <a href="https://dashthis.com">here.</a></p></li>
</ol>`;

const DEFAULT_RECOMMENDED_SETUP = `<ol>
<li><p><strong>Technical SEO Audit & Implementation</strong></p><p>We begin by thoroughly auditing your website's technical foundation, ensuring there are no crawlability or indexability issues. This includes optimizing robots.txt, XML sitemaps, page speed, mobile responsiveness, and fixing any broken links or redirect chains.</p></li>
<li><p><strong>On-Page Optimization</strong></p><p>Our team will optimize the core elements of your high-priority pages. This includes updating title tags, meta descriptions, header tags (H1-H6), and image alt text to align with targeted keywords and improve relevance in search results.</p></li>
<li><p><strong>Content Strategy & Creation</strong></p><p>We will develop a comprehensive content strategy aimed at targeting high-value keywords and addressing user intent. This includes creating new, high-quality blog posts, optimizing existing content, and ensuring a strong internal linking structure.</p></li>
<li><p><strong>Local SEO Setup (If Applicable)</strong></p><p>For businesses with a local presence, we will optimize your Google Business Profile, ensure NAP (Name, Address, Phone Number) consistency across directories, and implement local schema markup.</p></li>
<li><p><strong>Analytics & Tracking Setup</strong></p><p>We will configure Google Analytics, Google Search Console, and set up conversion tracking (e.g., form submissions, phone calls, purchases) to accurately measure the impact of our SEO efforts and provide data-driven insights.</p></li>
</ol>`;

const DEFAULT_RECOMMENDED_MONTHLY = `<ol>
<li><p><strong>Continued keyword research</strong></p><p>Ongoing keyword discovery and rank tracking remain essential. This gives us a clear baseline for how your top pages perform as we roll out optimizations.</p></li>
<li><p><strong>Continued optimization matrix</strong></p><p>We will advise on and deploy on-page SEO updates - including title tags, meta descriptions, headings, image naming conventions, internal linking, anchor text, and backlinking strategies - following the optimization matrix developed during setup.</p></li>
<li><p><strong>Consistent high-quality reporting</strong></p><p>We will refine your custom dashboard to monitor KPIs across traffic, engagement, and conversions. Additional reports and channels can be added as needed.</p></li>
<li><p><strong>Conversion rate optimization (CRO)</strong></p><p>CRO efforts include improvements to content, page design, CTAs, visuals, testimonials, and user flow. All recommendations are grounded in data your buyer personas.</p></li>
<li><p><strong>Backlink audit and long-term strategy</strong></p><p>Our team will evaluate your backlink profile to identify broken or redirected links. We will also support you in developing a long-term, legitimate backlink strategy using unlinked citations, media assets, competitor gaps, and existing relationships.</p></li>
<li><p><strong>Ongoing technical SEO audits</strong></p><p>Our audits will continue to flag and address duplicate content, sitemap and indexing issues, markup opportunities, crawl depth, redirects, canonicalization problems, broken pages, and other technical concerns.</p></li>
</ol>`;

export default function AuditEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const audit = useStore((state) => state.audits[id]);
  const currentUser = useStore((state) => state.currentUser);
  const allFindings = useStore((state) => state.findings);
  const findings = Object.values(allFindings).filter(f => f.auditId === id);
  const hasHydrated = useStore((state) => state.hasHydrated);
  const addFinding = useStore((state) => state.addFinding);
  const updateFinding = useStore((state) => state.updateFinding);
  
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState<number>(0.6);
  const [drawMode, setDrawMode] = useState<'cursor' | 'box' | 'arrow'>('cursor');
  const [isComposing, setIsComposing] = useState(false);
  const [isGeneratingSection, setIsGeneratingSection] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const updateAudit = useStore((state) => state.updateAudit);
  const updateReportStructure = useStore((state) => state.updateReportStructure);
  const updatePages = useStore((state) => state.updatePages);

  const [isModularExpanded, setIsModularExpanded] = useState(true);
  const [isFindingsExpanded, setIsFindingsExpanded] = useState(true);
  const [isLegacyExpanded, setIsLegacyExpanded] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isDraggingSidebar = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const initialObserverFired = useRef(false);
  
  // Keep track of layout dimensions when the user first navigates to a section
  // so that "Reset Layout" acts as an undo button rather than a destructive wipe.
  const layoutSnapshots = useRef<Record<string, any>>({});
  useEffect(() => {
    const currentFindings = Object.values(useStore.getState().findings).filter(f => f.auditId === id);
    
    currentFindings.forEach(f => {
      // Only capture the snapshot ONCE per session (the moment the finding is loaded/created)
      if (!layoutSnapshots.current[f.id]) {
        layoutSnapshots.current[f.id] = {
          verticalOffset: f.verticalOffset,
          horizontalOffset: f.horizontalOffset,
          imageVerticalOffset: f.imageVerticalOffset,
          imageHorizontalOffset: f.imageHorizontalOffset,
          image2VerticalOffset: f.image2VerticalOffset,
          image2HorizontalOffset: f.image2HorizontalOffset,
          businessImpactVerticalOffset: f.businessImpactVerticalOffset,
          businessImpactHorizontalOffset: f.businessImpactHorizontalOffset,
          recommendationVerticalOffset: f.recommendationVerticalOffset,
          recommendationHorizontalOffset: f.recommendationHorizontalOffset,
          boxWidth: f.boxWidth,
          imageWidth: f.imageWidth,
          image2Width: f.image2Width,
          businessImpactWidth: f.businessImpactWidth,
          recommendationWidth: f.recommendationWidth
        };
      }
    });
  }, [allFindings, id]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSidebar.current) {
        setSidebarWidth(Math.max(200, Math.min(600, e.clientX)));
      }
    };
    const handleMouseUp = () => {
      if (isDraggingSidebar.current) {
        isDraggingSidebar.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sidebarWidth]);


  const handleSidebarClick = (sectionId: string, findingId: string | null) => {
    // Clear all snapshots so they are freshly recreated with the current layout state
    // This ensures that when the user explicitly navigates away and comes back, 
    // the new baseline for "Reset Layout" becomes the state they are returning to.
    layoutSnapshots.current = {};
    
    setActiveSection(sectionId);
    setActiveFindingId(findingId);
    
    setTimeout(() => {
      const targetId = findingId ? `finding:${findingId}` : sectionId;
      const el = document.getElementById(targetId);
      if (el && scrollRef.current) {
        isProgrammaticScroll.current = true;
        const containerRect = scrollRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        
        // Calculate the absolute scaled scroll position of the element
        const offsetScaled = elRect.left - containerRect.left;
        const absoluteScrollX = scrollRef.current.scrollLeft + offsetScaled;
        
        // The container is scaled by previewScale. Each page is 850px + 20px gap = 870px.
        const scaledPageWidth = 870 * previewScale;
        const pageIndex = Math.round(absoluteScrollX / scaledPageWidth);
        
        scrollRef.current.scrollTo({
          left: pageIndex * scaledPageWidth,
          behavior: 'smooth'
        });
        
        // Re-enable observer after smooth scroll completes
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 800);
      }
    }, 100);
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (isProgrammaticScroll.current) return;
      
      if (!initialObserverFired.current) {
        initialObserverFired.current = true;
        return;
      }
      
      let maxRatio = 0;
      let targetId: string | null = null;
      
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          targetId = entry.target.id;
        }
      });
      
      if (targetId) {
        const id = targetId as string;
        if (id.startsWith('finding:')) {
          setActiveSection('findings');
          setActiveFindingId(id.split(':')[1]);
        } else {
          setActiveSection(id);
          setActiveFindingId(null);
        }
      }
    }, {
      root: scrollRef.current,
      threshold: 0.5
    });

    const timeoutId = setTimeout(() => {
      if (!scrollRef.current) return;
      const validSelectors = [
        '[id^="page:"]',
        '[id^="finding:"]', 
        '[id^="stage:"]',
        '[id="toc"]',
        '[id="cover"]',
        '[id="executive-summary"]',
        '[id="paid-search-opportunities"]',
        '[id="seo-onboarding"]',
        '[id="recommended-setup"]',
        '[id="recommended-monthly"]',
        '[id="conclusion"]'
      ].join(', ');
      const children = scrollRef.current.querySelectorAll(validSelectors);
      children.forEach(c => observer.observe(c));
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [audit, previewScale]);

  // Setup preview scaling to perfectly fit the user's screen height
  useEffect(() => {
    const updateScale = () => {
      // Available height = 100vh - 56px (main navbar) - 48px (preview pane header)
      const availableHeight = window.innerHeight - 56 - 48;
      
      // Calculate the exact scale needed to fit 1100px height
      const exactScale = availableHeight / 1100;
      setPreviewScale(exactScale);
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Listen for custom finding selection events from the live preview
  useEffect(() => {
    const handleSelectFinding = (e: Event) => {
      const customEvent = e as CustomEvent;
      const id = customEvent.detail;
      if (id && allFindings[id]) {
        setActiveFindingId(id);
        setIsFindingsExpanded(true);
        setActiveSection(`stage:${allFindings[id].stage}`);
      }
    };

    window.addEventListener('selectFinding', handleSelectFinding);
    return () => window.removeEventListener('selectFinding', handleSelectFinding);
  }, [allFindings]);
  // Redirect if audit not found or if a standard user tries to edit a template source
  useEffect(() => {
    if (!hasHydrated) return;
    if (!audit) {
      router.push('/dashboard');
      return;
    }
    if (audit.isTemplate && currentUser?.role === 'user') {
      router.push('/dashboard');
    }
  }, [audit, currentUser, router, hasHydrated]);

  // Emergency restore for executive summary
  useEffect(() => {
    if (audit?.pages && !audit.pages.find(p => p.id === 'executive-summary')) {
      import('@/lib/store').then(({ createDefaultPages, useStore }) => {
        const defaultPages = createDefaultPages();
        const execSummary = defaultPages.find(p => p.id === 'executive-summary');
        if (execSummary) {
          const newPages = [...(audit.pages || [])];
          newPages.splice(1, 0, execSummary);
          useStore.getState().updatePages(audit.id, newPages);
        }
      });
    }
  }, [audit?.pages, audit?.id]);

  if (!hasHydrated || !audit) return null;



  const handleGenerateSection = async (sectionType: 'executive-summary' | 'conclusion') => {
    if (findings.length === 0) {
      alert("You need at least one finding to generate this section.");
      return;
    }

    // Extract context from other pages
    const otherPagesContext = audit.pages
      ?.filter(p => !['cover', 'toc', 'executive-summary', 'findings', 'conclusion'].includes(p.id) && !p.isHidden)
      .map(p => {
        const title = p.title || p.id;
        const textBlocks = p.blocks.map(b => {
          if (b.type === 'RichText') return b.data.html || '';
          if (b.type === 'ProcessSteps') return b.data.steps?.map((s: any) => `${s.title}: ${s.description}`).join(' ') || '';
          if ((b.type as string) === 'PricingTable') return b.data.items?.map((i: any) => `${i.name}: ${i.description}`).join(' ') || '';
          return '';
        }).filter(text => text).join(' ');
        
        // Strip basic HTML tags for cleaner context
        const cleanText = textBlocks.replace(/<[^>]*>?/gm, '');
        return cleanText ? `--- PAGE: ${title} ---\n${cleanText}` : null;
      })
      .filter(Boolean)
      .join('\n\n');

    setIsGeneratingSection(true);
    try {
      // Strip out all base64 images from findings to avoid 413 Payload Too Large
      const strippedFindings = findings.map(f => {
        const copy: any = { ...f };
        delete copy.mainImage;
        delete copy.imageUrls;
        delete copy.competitorImage;
        delete copy.competitorImageUrls;
        return copy;
      });

      const res = await fetch("/audits/api/ai/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findings: strippedFindings,
          companyName: audit.companyName,
          industry: audit.industry,
          sectionType,
          otherPagesContext,
          customStages: audit.reportStructure?.customStages || []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");

      // For modular pages
      if (audit.pages && audit.pages.length > 0) {
        const newPages = JSON.parse(JSON.stringify(audit.pages));
        const page = newPages.find((p: any) => p.id === sectionType);
        if (page) {
          const richTextBlock = page.blocks.find((b: any) => b.type === 'RichText');
          if (richTextBlock && richTextBlock.data) {
            richTextBlock.data.html = data.html;
          } else if (richTextBlock) {
            richTextBlock.data = { html: data.html };
          }
        }
        updatePages(id, newPages);
      } else {
        // For legacy
        if (sectionType === 'executive-summary') {
          updateReportStructure(id, { executiveSummary: data.html });
        } else {
          updateReportStructure(id, { conclusion: data.html });
        }
      }
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingSection(false);
    }
  };

  const handleCompose = async () => {
    setIsComposing(true);
    // Directly route to the paginated print preview, bypassing the legacy AI Orchestrator entirely
    router.push(`/${id}/report`);
    setIsComposing(false);
  };

  return (
    <div className="flex-1 flex min-h-0 w-full h-full relative overflow-hidden">
      {/* Left Sidebar - Navigation & Findings List */}
      <div 
        style={{ width: `${sidebarWidth}px` }}
        className="shrink-0 border-r border-white/10 bg-[#0c0d1c]/50 flex flex-col min-h-0 h-full"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white truncate">{audit.companyName}</h2>
          <p className="text-sm text-muted-foreground truncate">{audit.websiteUrl}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2 min-h-0">
          {/* Legacy Report hidden to avoid conflicting paradigms */}
          {false && !(audit.pages && audit.pages!.length > 0) && audit.reportStructure && (
            <>
              <button onClick={() => setIsLegacyExpanded(!isLegacyExpanded)} className="flex items-center justify-between w-full mb-2 px-2 mt-4 hover:bg-white/5 p-1 rounded transition-colors">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Legacy Report</span>
                <svg className={`w-4 h-4 text-white/50 transition-transform ${isLegacyExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isLegacyExpanded && (
                <>
                  <button
                    onClick={() => handleSidebarClick("executive-summary", null)}
                    className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "executive-summary" ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="font-medium text-white text-sm">Executive Summary</div>
                  </button>
                  <button
                    onClick={() => handleSidebarClick("paid-search-opportunities", null)}
                    className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "paid-search-opportunities" ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="font-medium text-white text-sm truncate">{audit.reportStructure?.customHeadings?.paidSearchOpportunities || "Paid Search Strategic Opportunities"}</div>
                  </button>
                  <button
                    onClick={() => handleSidebarClick("seo-onboarding", null)}
                    className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "seo-onboarding" ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="font-medium text-white text-sm truncate">{audit.reportStructure?.customHeadings?.seoOnboarding || "SEO Onboarding Process"}</div>
                  </button>
                  <button
                    onClick={() => handleSidebarClick("recommended-setup", null)}
                    className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "recommended-setup" ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="font-medium text-white text-sm truncate">{audit.reportStructure?.customHeadings?.recommendedSetup || "Recommended Organic SEO Setup"}</div>
                  </button>
                  <button
                    onClick={() => handleSidebarClick("recommended-monthly", null)}
                    className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "recommended-monthly" ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="font-medium text-white text-sm truncate">{audit.reportStructure?.customHeadings?.recommendedMonthly || "Recommended Monthly Services"}</div>
                  </button>
                  <button
                    onClick={() => handleSidebarClick("conclusion", null)}
                    className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "conclusion" ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="font-medium text-white text-sm truncate">{audit.reportStructure?.customHeadings?.conclusion || "Conclusion"}</div>
                  </button>
                </>
              )}
            </>
          )}

          {audit.pages && audit.pages.length > 0 && (
            <>
              <button onClick={() => setIsModularExpanded(!isModularExpanded)} className="flex items-center justify-between w-full mb-2 px-2 mt-4 hover:bg-white/5 p-1 rounded transition-colors">
                <span className="text-xs font-semibold text-[#0057FF] uppercase tracking-wider">Pages</span>
                <svg className={`w-4 h-4 text-white/50 transition-transform ${isModularExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isModularExpanded && (
                <SortablePagesList 
                  audit={audit} 
                  activeSection={activeSection || ""} 
                  onSelectPage={(id) => {
                    if (id === "toc_pseudo_id") {
                      handleSidebarClick("toc", null);
                    } else {
                      handleSidebarClick("page:" + id, null);
                    }
                  }} 
                  activeFindingId={activeFindingId}
                  onSelectFinding={(id) => handleSidebarClick("findings", id)}
                />
              )}
            </>
          )}


        </div>
        
        <div className="p-4 border-t border-white/10 bg-[#050505]">
          <Button 
            onClick={handleCompose}
            disabled={isComposing}
            className="w-full bg-gradient-primary text-white border-0 shadow-lg shadow-indigo-500/20"
          >
            <Layers className="mr-2 h-4 w-4" /> 
            {isComposing ? "Generating..." : "Generate PDF"}
          </Button>
        </div>
      </div>

      {/* Divider between Sidebar and Editor */}
      <div 
        onMouseDown={() => {
          isDraggingSidebar.current = true;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        }}
        className="w-[3px] hover:w-[6px] cursor-col-resize bg-white/5 hover:bg-indigo-500/80 active:bg-indigo-500 transition-all z-50 shrink-0" 
      />

      {/* Central Editor Pane */}
      <div 
        className="flex-1 bg-[#050505] overflow-y-auto border-r border-white/5 relative z-10 flex flex-col custom-scrollbar min-h-0"
      >
        {activeSection?.startsWith("page:") && audit.pages ? (() => {
          const pageId = activeSection.split(":")[1];
          const pageIndex = audit.pages.findIndex(p => p.id === pageId);
          const page = audit.pages[pageIndex];
          if (!page) return null;
          
          if (pageId === 'findings') {
            return (
              <div className="p-8 w-full mx-auto pb-32">
                <h1 className="text-3xl font-bold text-white mb-8">Findings Section</h1>
                <GlassPanel className="p-8 shadow-2xl bg-black/40 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="h-20 w-20 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
                    <Layers className="h-10 w-10 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Manage Your Audit Findings</h2>
                  <p className="text-muted-foreground max-w-md font-serif text-lg mb-6">
                    This section houses your structured audit findings. To edit a specific finding, expand the Findings section in the sidebar and select any item.
                  </p>
                </GlassPanel>
              </div>
            );
          }
          
          return (
            <div className="p-8 w-full mx-auto pb-32">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Edit {page.title}</h1>
                <div className="flex items-center gap-4">
                  {(page.id === 'seo-onboarding' || page.id === 'recommended-setup') && (
                    <select
                      className="bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={page.layout || 'standard'}
                      onChange={(e) => {
                        const newPages = [...audit.pages!];
                        newPages[pageIndex] = { ...page, layout: e.target.value as 'standard' | 'split-focus' };
                        updateAudit(id, { pages: newPages });
                      }}
                    >
                      <option value="standard">Standard Layout</option>
                      <option value="split-focus">Split Focus</option>
                    </select>
                  )}
                  {(pageId === 'executive-summary' || pageId === 'conclusion') && (
                    <Button 
                      onClick={() => handleGenerateSection(pageId as 'executive-summary' | 'conclusion')}
                      disabled={isGeneratingSection}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 border-0 shadow-lg shadow-indigo-500/20 px-6"
                    >
                      {isGeneratingSection ? "✨ Generating..." : "✨ Auto-Generate via AI"}
                    </Button>
                  )}
                </div>
              </div>
              <GlassPanel className="p-8 shadow-2xl bg-black/40">
                <BlockEditor 
                  blocks={page.blocks || []} 
                  onChange={(newBlocks) => {
                    const newPages = [...audit.pages!];
                    newPages[pageIndex] = { ...newPages[pageIndex], blocks: newBlocks };
                    
                    // Sync the outer page.title with the HeroHeader so the sidebar updates instantly
                    const heroBlock = newBlocks.find((b: any) => b.type === 'HeroHeader');
                    if (heroBlock && heroBlock.data.title && heroBlock.data.title !== page.title) {
                      newPages[pageIndex].title = heroBlock.data.title;
                    }

                    updateAudit(id, { pages: newPages });
                  }} 
                  auditId={id}
                  pageId={page.id}
                />
              </GlassPanel>
            </div>
          );
        })() : activeSection === "executive-summary" && audit.reportStructure ? (
          <div className="p-8 w-full mx-auto pb-32">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Edit Executive Summary</h1>
              <Button 
                onClick={() => handleGenerateSection('executive-summary')}
                disabled={isGeneratingSection}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 border-0 shadow-lg shadow-indigo-500/20 px-6"
              >
                {isGeneratingSection ? "✨ Generating..." : "✨ Auto-Generate via AI"}
              </Button>
            </div>
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <label className="text-sm font-medium text-white/70 uppercase tracking-wider block">Executive Narrative</label>
                   <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Drop images directly into editor</span>
                </div>
                <div className="rounded-md border border-white/10 shadow-lg bg-black/20 backdrop-blur-md">
                  <RichTextEditor 
                    value={audit.reportStructure.executiveSummary || ""}
                    onChange={(val) => updateReportStructure(id, { executiveSummary: val })}
                    minHeight="500px"
                  />
                </div>
              </div>
            </GlassPanel>
          </div>
        ) : activeSection === "paid-search-opportunities" && audit.reportStructure ? (
          <div className="p-8 w-full mx-auto pb-32">
            <h1 className="text-3xl font-bold text-white mb-8">Edit Paid Search Strategic Opportunities</h1>
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
              <div className="space-y-6">
                <div className="mb-6">
                   <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Display Title</label>
                   <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={audit.reportStructure.customHeadings?.paidSearchOpportunities ?? "Paid Search Strategic Opportunities"} placeholder="Paid Search Strategic Opportunities" onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, paidSearchOpportunities: e.target.value } })} />
                </div>

                 <div className="border-t border-white/10 pt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Competitor Images</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 p-4 rounded-md border border-white/10">
                        <label className="text-sm font-medium text-white/70 mb-3 block uppercase tracking-wider">Competitor 1 Image</label>
                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/40 h-40 relative">
                          <img 
                            src={audit.reportStructure.paidSearchData?.competitors?.[0]?.imageUrl || "https://placehold.co/800x500/ee0000/ffffff?text=Spiral+Brushes+Website+Mockup"} 
                            alt="Competitor 1" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <input type="file" accept="image/*" className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const compressed = await compressImage(reader.result as string, 800, 0.7);
                              const comps = audit.reportStructure!.paidSearchData?.competitors || [{name: "Spiral Brushes Inc", description: "", imageUrl: ""}, {name: "Bolex Brushes", description: "", imageUrl: ""}];
                              comps[0].imageUrl = compressed;
                              updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, competitors: comps } });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                      <div className="bg-white/5 p-4 rounded-md border border-white/10">
                        <label className="text-sm font-medium text-white/70 mb-3 block uppercase tracking-wider">Competitor 2 Image</label>
                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/40 h-40 relative">
                          <img 
                            src={audit.reportStructure.paidSearchData?.competitors?.[1]?.imageUrl || "https://placehold.co/800x500/ffffff/000000?text=Bolex+Brush+Website+Mockup"} 
                            alt="Competitor 2" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <input type="file" accept="image/*" className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const compressed = await compressImage(reader.result as string, 800, 0.7);
                              const comps = audit.reportStructure!.paidSearchData?.competitors || [{name: "Spiral Brushes Inc", description: "", imageUrl: ""}, {name: "Bolex Brushes", description: "", imageUrl: ""}];
                              comps[1].imageUrl = compressed;
                              updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, competitors: comps } });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                    </div>
                 </div>

                <div className="border-t border-white/10 pt-6">
                   <h3 className="text-xl font-bold text-white mb-4">Core Page Content</h3>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Top Panel Title</label>
                       <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" 
                              value={audit.reportStructure.paidSearchData?.panelTitle ?? "Growth Is On Your Side, and Competitors<br/>Have Yet to Catch Up"} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, panelTitle: e.target.value } })} />
                     </div>
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Top Panel Paragraph 1</label>
                       <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white min-h-[80px]" 
                              value={audit.reportStructure.paidSearchData?.panelText1 ?? "Sealeze's current landscape presents a strong opportunity to capture paid<br/>placements that competitors are overlooking."} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, panelText1: e.target.value } })} />
                     </div>
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Top Panel Paragraph 2</label>
                       <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white min-h-[80px]" 
                              value={audit.reportStructure.paidSearchData?.panelText2 ?? "Through a focused competitive analysis, we've identified a <strong className=\"text-black\">2-part strategy</strong> to<br/>strengthen and expand your paid search performance."} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, panelText2: e.target.value } })} />
                     </div>
                     
                     <div className="w-full h-px bg-white/10 my-4"></div>
                     
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Step 1 Title</label>
                       <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" 
                              value={audit.reportStructure.paidSearchData?.step1Title ?? "Step 1: Competitive Keyword Analysis"} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, step1Title: e.target.value } })} />
                     </div>
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Step 1 Text</label>
                       <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white min-h-[80px]" 
                              value={audit.reportStructure.paidSearchData?.step1Text1 ?? "Lower cost-per-click estimates across key terms suggest there's room to capture high-intent searches without overspending. Focusing on these queries gives Sealeze a practical way to drive more qualified traffic and meaningful conversions."} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, step1Text1: e.target.value } })} />
                     </div>

                     <div className="w-full h-px bg-white/10 my-4"></div>
                     
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Step 2 Title</label>
                       <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" 
                              value={audit.reportStructure.paidSearchData?.step2Title ?? "Step 2: Landing Page Optimization"} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, step2Title: e.target.value } })} />
                     </div>
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Step 2 Paragraph 1</label>
                       <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white min-h-[80px]" 
                              value={audit.reportStructure.paidSearchData?.step2Text1 ?? "A review of competitor ads triggered by queries like \"strip brushes\" shows relatively limited competition in paid search. Note however that to fully capitalize on this gap, product pages must be properly optimized to support conversion and Quality Score."} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, step2Text1: e.target.value } })} />
                     </div>
                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Step 2 Paragraph 2</label>
                       <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white min-h-[80px]" 
                              value={audit.reportStructure.paidSearchData?.step2Text2 ?? "Below are examples of competitor pages against which Sealeze's current pages already demonstrate a competitive advantage."} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, step2Text2: e.target.value } })} />
                     </div>

                     <div className="w-full h-px bg-white/10 my-4"></div>

                     <div>
                       <label className="text-sm text-white/70 mb-2 block">Conclusion Text</label>
                       <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white min-h-[80px]" 
                              value={audit.reportStructure.paidSearchData?.conclusionText ?? "Given the current quality of competitor ads, Sealeze is well positioned to launch a search campaign that outperforms the field. With a few targeted landing page adjustments, the brand could convert that advantage into measurable gains."} 
                              onChange={(e) => updateReportStructure(id, { paidSearchData: { ...audit.reportStructure!.paidSearchData, conclusionText: e.target.value } })} />
                     </div>
                   </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                   <h3 className="text-xl font-bold text-white mb-4">Additional Narrative (Optional)</h3>
                   <div className="rounded-md border border-white/10 shadow-lg bg-black/20 backdrop-blur-md">
                     <RichTextEditor 
                       value={audit.reportStructure.paidSearchOpportunities ?? ""}
                       onChange={(val) => updateReportStructure(id, { paidSearchOpportunities: val })}
                       minHeight="300px"
                     />
                   </div>
                </div>
              </div>
            </GlassPanel>
          </div>
        ) : activeSection === "seo-onboarding" && audit.reportStructure ? (
          <div className="p-8 w-full mx-auto pb-32">
            <h1 className="text-3xl font-bold text-white mb-8">Edit SEO Onboarding Process</h1>
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
              <div className="mb-6">
                 <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Display Title</label>
                 <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={audit.reportStructure.customHeadings?.seoOnboarding ?? "SEO Onboarding Process"} placeholder="SEO Onboarding Process" onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, seoOnboarding: e.target.value } })} />
              </div>
              <div className="mb-6">
                 <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Subtext</label>
                 <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" value={audit.reportStructure.customHeadings?.seoOnboardingSubtext ?? "Our structured approach to ensuring long-term success and continuous growth."} placeholder="Enter subtext to display under the heading" onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, seoOnboardingSubtext: e.target.value } })} />
              </div>
              <div className="rounded-md border border-white/10 shadow-lg bg-black/20 backdrop-blur-md">
                <RichTextEditor 
                  value={audit.reportStructure.seoOnboarding ?? DEFAULT_SEO_ONBOARDING}
                  onChange={(val) => updateReportStructure(id, { seoOnboarding: val })}
                  minHeight="400px"
                />
              </div>
            </GlassPanel>
          </div>
        ) : activeSection === "recommended-setup" && audit.reportStructure ? (
          <div className="p-8 w-full mx-auto pb-32">
            <h1 className="text-3xl font-bold text-white mb-8">Edit Recommended Organic SEO Setup</h1>
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
              <div className="mb-6">
                 <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Display Title</label>
                 <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={audit.reportStructure.customHeadings?.recommendedSetup ?? "Recommended Organic SEO Setup"} placeholder="Recommended Organic SEO Setup" onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, recommendedSetup: e.target.value } })} />
              </div>
              <div className="rounded-md border border-white/10 shadow-lg bg-black/20 backdrop-blur-md">
                <RichTextEditor 
                  value={audit.reportStructure.recommendedSetup ?? DEFAULT_RECOMMENDED_SETUP}
                  onChange={(val) => updateReportStructure(id, { recommendedSetup: val })}
                  minHeight="400px"
                />
              </div>
            </GlassPanel>
          </div>
        ) : activeSection === "recommended-monthly" && audit.reportStructure ? (
          <div className="p-8 w-full mx-auto pb-32">
            <h1 className="text-3xl font-bold text-white mb-8">Edit Recommended Monthly SEO Services</h1>
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
              <div className="mb-6">
                 <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Display Title</label>
                 <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={audit.reportStructure.customHeadings?.recommendedMonthly ?? "Recommended Monthly SEO Services"} placeholder="Recommended Monthly SEO Services" onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, recommendedMonthly: e.target.value } })} />
              </div>
              <div className="rounded-md border border-white/10 shadow-lg bg-black/20 backdrop-blur-md">
                <RichTextEditor 
                  value={audit.reportStructure.recommendedMonthly ?? DEFAULT_RECOMMENDED_MONTHLY}
                  onChange={(val) => updateReportStructure(id, { recommendedMonthly: val })}
                  minHeight="400px"
                />
              </div>
            </GlassPanel>
          </div>
        ) : activeSection === "conclusion" && audit.reportStructure ? (
          <div className="p-8 w-full mx-auto pb-32">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Edit Conclusion</h1>
              <Button 
                onClick={() => handleGenerateSection('conclusion')}
                disabled={isGeneratingSection}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 border-0 shadow-lg shadow-indigo-500/20 px-6"
              >
                {isGeneratingSection ? "✨ Generating..." : "✨ Auto-Generate via AI"}
              </Button>
            </div>
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
              <div className="mb-6 grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Display Title</label>
                   <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={audit.reportStructure.customHeadings?.conclusion ?? "Conclusion"} placeholder="Conclusion" onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, conclusion: e.target.value } })} />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-white/70 uppercase tracking-wider block mb-2">Section Display Subtitle</label>
                   <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={audit.reportStructure.customHeadings?.conclusionSubtext ?? "You've scaled the platform. Now let's scale how it's seen."} placeholder="You've scaled the platform. Now let's scale how it's seen." onChange={(e) => updateReportStructure(id, { customHeadings: { ...audit.reportStructure!.customHeadings, conclusionSubtext: e.target.value } })} />
                 </div>
              </div>
              <div className="rounded-md border border-white/10 shadow-lg bg-black/20 backdrop-blur-md">
                <RichTextEditor 
                  value={(!audit.reportStructure.conclusion || audit.reportStructure.conclusion === '<p></p>' || audit.reportStructure.conclusion.includes('Your brand operates in a market')) ? DEFAULT_CONCLUSION : audit.reportStructure.conclusion}
                  onChange={(val) => updateReportStructure(id, { conclusion: val })}
                  minHeight="400px"
                />
              </div>
            </GlassPanel>
          </div>
        ) : activeFindingId ? (
          <div className="p-8 w-full mx-auto pb-32">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Edit Finding</h1>
            </div>
            
            <GlassPanel className="p-8 shadow-2xl bg-black/40">
               <FindingEntryForm key={activeFindingId} findingId={activeFindingId} />
            </GlassPanel>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <div className="h-20 w-20 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
              <LayoutTemplate className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Audit <GradientText>Workspace</GradientText></h2>
            <p className="text-muted-foreground max-w-md font-serif text-lg">
              Select a page from the sidebar to edit, or add a new page to begin building the audit for {audit.companyName}.
            </p>
          </div>
        )}
      </div>

      {/* Right-Side Live Preview Pane */}
      <div 
        className="hidden lg:flex flex-col relative overflow-hidden bg-[#111] border-l border-white/10 shrink-0"
        style={{ width: `${850 * previewScale}px` }}
      >
         {/* Badge Header Bar with Drawing Tools */}
         <div className="h-12 w-full flex items-center justify-between px-4 shrink-0 bg-[#0c0d1c] border-b border-white/10 z-20">
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Live Print Preview
            </div>
            
            <div className="flex items-center gap-4">
              {(activeSection?.startsWith('stage:') || activeSection === 'findings') && (
                showResetConfirm ? (
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Are you sure?</span>
                    <button 
                      onClick={() => {
                        if (!scrollRef.current) return;
                        const containerRect = scrollRef.current.getBoundingClientRect();
                        const visibleFindingIds = Array.from(scrollRef.current.querySelectorAll('[id^="finding:"]')).filter(el => {
                          const rect = el.getBoundingClientRect();
                          return rect.left >= containerRect.left - 10 && rect.left < containerRect.right - 10;
                        }).map(el => el.id.split(':')[1]);

                        visibleFindingIds.forEach(id => {
                          const snap = layoutSnapshots.current[id];
                          if (!snap) return; // Do not wipe if snapshot is missing

                          updateFinding(id, {
                            verticalOffset: snap.verticalOffset,
                            horizontalOffset: snap.horizontalOffset,
                            imageVerticalOffset: snap.imageVerticalOffset,
                            imageHorizontalOffset: snap.imageHorizontalOffset,
                            image2VerticalOffset: snap.image2VerticalOffset,
                            image2HorizontalOffset: snap.image2HorizontalOffset,
                            businessImpactVerticalOffset: snap.businessImpactVerticalOffset,
                            businessImpactHorizontalOffset: snap.businessImpactHorizontalOffset,
                            recommendationVerticalOffset: snap.recommendationVerticalOffset,
                            recommendationHorizontalOffset: snap.recommendationHorizontalOffset,
                            boxWidth: snap.boxWidth,
                            imageWidth: snap.imageWidth,
                            image2Width: snap.image2Width,
                            businessImpactWidth: snap.businessImpactWidth,
                            recommendationWidth: snap.recommendationWidth
                          });
                        });
                        setShowResetConfirm(false);
                      }}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 ml-2"
                    >
                      Yes
                    </button>
                    <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                    <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="text-[10px] font-bold text-white/50 hover:text-white/80"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!scrollRef.current) return;
                      
                      const containerRect = scrollRef.current.getBoundingClientRect();
                      const visibleFindingIds = Array.from(scrollRef.current.querySelectorAll('[id^="finding:"]')).filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.left >= containerRect.left - 10 && rect.left < containerRect.right - 10;
                      }).map(el => el.id.split(':')[1]);

                      if (visibleFindingIds.length === 0) {
                        alert("No findings found on the current page.");
                        return;
                      }

                      setShowResetConfirm(true);
                    }}
                    className="bg-black/40 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Reset Layout
                  </button>
                )
              )}

              <div className="flex items-center gap-1 bg-black/40 rounded-md p-1 border border-white/10">
              <button
                onClick={() => setDrawMode('cursor')}
                className={`p-1.5 rounded transition-colors ${drawMode === 'cursor' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                title="Cursor (Select/Drag)"
              >
                <MousePointer2 size={16} />
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
              <button
                onClick={() => setDrawMode('box')}
                className={`p-1.5 rounded transition-colors ${drawMode === 'box' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                title="Draw Box Annotation"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => setDrawMode('arrow')}
                className={`p-1.5 rounded transition-colors ${drawMode === 'arrow' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                title="Draw Arrow Annotation"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
            </div>
         </div>

         {/* The Paper Container */}
         <div className="flex-1 w-full relative overflow-hidden bg-[#1a1a1a] flex group items-center justify-center">
            
            {/* Pagination Controls */}
            <button 
              onClick={() => scrollRef.current?.scrollBy({ left: -(870 * previewScale), behavior: 'smooth' })}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center z-50 transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/10 pointer-events-auto"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scrollRef.current?.scrollBy({ left: (870 * previewScale), behavior: 'smooth' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center z-50 transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/10 pointer-events-auto"
            >
              <ChevronRight size={24} />
            </button>

            {/* Masking Viewport */}
            <div 
              ref={scrollRef} 
              className="relative overflow-hidden shrink-0 shadow-2xl bg-white"
              style={{ 
                width: `${850 * previewScale}px`, 
                height: `${1100 * previewScale}px`
              }}
            >
              <div 
                style={{ 
                  zoom: previewScale,
                  width: 'max-content',
                  minHeight: '1100px'
                }}
              >
                 <LivePreview 
                   audit={audit} 
                   activeSection={activeSection || ""} 
                   activeFindingId={activeFindingId} 
                   drawMode={drawMode}
                   onFindingSelect={(id) => {
                     setActiveFindingId(id);
                     setIsFindingsExpanded(true);
                     if (allFindings[id]?.stage) {
                       setActiveSection(`stage:${allFindings[id].stage}`);
                     }
                   }}
                 />
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
