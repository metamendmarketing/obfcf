/**
 * @file LivePreview.tsx
 * @description The core rendering engine for the visual audit output. 
 * Renders both modern block-based pages and legacy static sections. 
 * This component is responsible for scale-to-fit zooming, enforcing A4 page aspect ratios,
 * and maintaining visual consistency for the final PDF export via html2canvas.
 */

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useStore, Audit, Finding } from "@/lib/store";
import { AbstractWaves } from "../ui/AbstractWaves";
import { AbstractMesh } from "../ui/AbstractMesh";
import { BlockRenderer } from "../blocks/BlockRenderer";
import { CoverBlock } from "../blocks/CoverBlock";
import { ThankYouBlock } from "../blocks/ThankYouBlock";
import { MetamendLogo } from "../ui/MetamendLogo";
import {
  LegacyExecutiveSummary,
  LegacyPaidSearch,
  LegacySeoOnboarding,
  LegacyRecommendedSetup,
  LegacyRecommendedMonthly,
  LegacyConclusion,
  LegacyStageBlock
} from "./LegacySections";
import { AnnotationCanvas } from "./AnnotationCanvas";

export const PaginatedSection = ({ 
  isCover = false,
  backgroundColor = "#f4f5f7",
  backgroundSVG,
  children,
  sectionId,
  startPageNum,
  onPageCountChange,
  renderCanvas
}: {
  isCover?: boolean;
  backgroundColor?: string;
  backgroundSVG?: React.ReactNode | ((pageIndex: number) => React.ReactNode);
  children: React.ReactNode;
  sectionId?: string;
  startPageNum?: number;
  onPageCountChange?: (id: string, count: number) => void;
  renderCanvas?: () => React.ReactNode;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(1);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const updatePages = () => {
      if (!contentRef.current) return;
      const scrollWidth = contentRef.current.scrollWidth;
      const pages = Math.max(1, Math.ceil(scrollWidth / 870));
      if (pages !== numPages) {
        setNumPages(pages);
        if (sectionId && onPageCountChange) {
          onPageCountChange(sectionId, pages);
        }
      }
    };
    updatePages();
    const observer = new ResizeObserver(updatePages);
    observer.observe(contentRef.current);
    
    // MutationObserver to catch text changes that might expand width
    const mutObserver = new MutationObserver(updatePages);
    mutObserver.observe(contentRef.current, { childList: true, subtree: true, characterData: true });

    const intervalId = setInterval(updatePages, 500);

    return () => {
      observer.disconnect();
      mutObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [numPages, sectionId, onPageCountChange]);

  const Header = () => (
    <div className="absolute top-0 left-0 right-0 h-[68px] bg-[#111] px-12 flex items-center justify-between z-20 shadow-sm border-b border-black/5">
      <MetamendLogo className="h-7 w-auto text-white opacity-90" />
    </div>
  );

  const Footer = ({ pageNum }: { pageNum: number }) => {
    const displayNum = startPageNum !== undefined ? startPageNum + pageNum - 1 : pageNum;
    return (
      <>
        <div className="absolute bottom-16 left-12 right-12 h-px bg-[#cbd5e1] z-10"></div>
        <div className="absolute bottom-8 right-12 font-bold text-black tracking-[0.2em] text-[0.8rem] z-10 pointer-events-none">
          {displayNum} | P a g e
        </div>
      </>
    );
  };

  // Move the content block up by reducing marginTop from 116 to 92 (68px header + 24px padding).
  // Increase contentHeight to allow more content to flow before spilling to the next page.
  const contentHeight = isCover ? 1100 : 930;
  const marginTop = isCover ? 0 : 92;

  return (
    <div id={sectionId} className="relative flex gap-[20px] shrink-0" style={{ width: `${numPages * 850 + (numPages - 1) * 20}px` }}>
      {/* Background Frames */}
      <div className="absolute inset-0 flex gap-[20px] pointer-events-none z-0">
        {Array.from({ length: numPages }).map((_, i) => (
          <div key={i} className="w-[850px] h-[1100px] shrink-0 relative shadow-xl overflow-hidden" style={{ backgroundColor }}>
            {!isCover && <Header />}
            {!isCover && <Footer pageNum={i + 1} />}
            {typeof backgroundSVG === 'function' ? backgroundSVG(i) : backgroundSVG}
          </div>
        ))}
      </div>

      {/* Foreground Content Flow */}
      <div 
        ref={contentRef}
        className="z-10 text-black relative"
        style={{
          height: `${contentHeight}px`,
          columnWidth: '850px',
          columnGap: '20px',
          columnFill: 'auto',
          marginTop: `${marginTop}px`,
        }}
      >
        <div className="w-[850px]">
          {children}
        </div>
      </div>
      
      {/* Canvas Overlay for Annotations */}
      {renderCanvas && renderCanvas()}
    </div>
  );
};

export const TocBlock = ({ audit, sections, pageCounts, orderedSections }: any) => {
  const tableOfContents = audit.reportStructure?.tableOfContents || [];
  
  // Compute TOC items with exact page numbers
  let tocItems: any[] = [];
  if (tableOfContents.length > 0) {
    tocItems = tableOfContents;
  } else {
    // Generate accurate dynamic TOC
    let currentPage = 1;
    let absolutePage = 1;
    for (const sectionId of orderedSections) {
      const count = pageCounts[sectionId] || 1;

      if (sectionId === 'page:cover' || sectionId === 'toc' || sectionId === 'page:thank-you') {
        absolutePage += count;
        continue;
      }
      
      // Determine title
      let title = "Section";
      let isSubItem = false;
      if (sectionId.startsWith('page:')) {
        const p = audit.pages?.find((p: any) => p.id === sectionId.split(':')[1]);
        if (p) title = p.title;
      } else if (sectionId.startsWith('finding:')) {
        title = "Finding";
      } else if (sectionId.startsWith('stage:')) {
        title = sectionId.split(':')[1];
      } else {
        // Legacy
        if (sectionId === 'executive-summary') title = "Executive Summary";
        else if (sectionId === 'paid-search-opportunities') title = audit.reportStructure?.customHeadings?.paidSearchOpportunities || "Paid Search Strategic Opportunities";
        else if (sectionId === 'seo-onboarding') title = audit.reportStructure?.customHeadings?.seoOnboarding || "SEO Onboarding Process";
        else if (sectionId === 'recommended-setup') title = audit.reportStructure?.customHeadings?.recommendedSetup || "Recommended Organic SEO Setup";
        else if (sectionId === 'recommended-monthly') title = audit.reportStructure?.customHeadings?.recommendedMonthly || "Recommended Monthly SEO Services";
        else if (sectionId === 'conclusion') title = audit.reportStructure?.customHeadings?.conclusion || "Conclusion";
      }

      if (!sectionId.startsWith('finding:')) {
        tocItems.push({ title, pageNumber: String(currentPage).padStart(2, '0'), absolutePage, sectionId });
      }
      
      currentPage += count;
      absolutePage += count;
    }
  }

  let textClass = "text-[1.35rem]";
  let titleMargin = "mb-10";
  if (tocItems.length > 20) {
      textClass = "text-[0.8rem] leading-tight";
      titleMargin = "mb-4";
  } else if (tocItems.length > 15) {
      textClass = "text-[0.9rem] leading-tight";
      titleMargin = "mb-4";
  } else if (tocItems.length > 12) {
      textClass = "text-[0.95rem] leading-tight";
      titleMargin = "mb-5";
  } else if (tocItems.length > 8) {
      textClass = "text-[1.05rem] leading-tight";
      titleMargin = "mb-6";
  }

  return (
    <section id="toc" className="w-[850px] flex grid grid-cols-12 bg-[#f4f5f7] shrink-0 break-inside-avoid-page relative">
      <div className="col-span-4 relative overflow-hidden h-full z-10 border-r border-black/10 min-h-[1100px]">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to bottom right, #0A0A0A, #0A0A0A, #111326)' }}></div>
        <div className="absolute inset-0 w-full h-full z-0">
           <AbstractWaves variant="dark" noMask pattern="toc" />
        </div>
      </div>
      <div className="col-span-8 px-20 pt-16 pb-24 flex flex-col justify-start relative z-20 min-h-[1100px]">
         <h2 className={`text-[3.5rem] font-black tracking-tighter text-black leading-[1.1] ${titleMargin} font-sans`}>
           Table of<br/>Contents
         </h2>
         <div className="relative pl-10 pr-4 w-full flex-1">
           <div className={`border-l-[4px] border-black pl-8 flex flex-col justify-between h-full py-2`}>
              {tocItems.map((item: any, idx: number) => (
                <a href={`#${item.sectionId || ''}`} data-page={item.absolutePage || parseInt(item.pageNumber, 10)} key={idx} className={`flex items-center gap-6 cursor-pointer hover:opacity-70 transition-opacity`}>
                   <span className={`${textClass} font-bold w-8 text-black text-right shrink-0`}>{item.pageNumber}</span>
                   <span className={`${textClass} ${item.isSubItem ? 'font-normal text-gray-700' : 'font-bold text-black'}`}>{item.title}</span>
                </a>
              ))}
           </div>
         </div>
      </div>
    </section>
  );
};


interface LivePreviewProps {
  audit: Audit;
  activeSection: string;
  activeFindingId: string | null;
  onFindingSelect?: (findingId: string) => void;
  drawMode?: 'cursor' | 'box' | 'arrow';
}

export function LivePreview({ audit, activeSection, activeFindingId, onFindingSelect, drawMode = 'cursor' }: LivePreviewProps) {
  const findingsObj = useStore(state => state.findings);
  const rawFindings: Finding[] = (audit as any).findings || Object.values(findingsObj).filter(f => f.auditId === audit.id);
  const findings = [...rawFindings].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sections = audit.reportStructure?.sections || [];

  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});

  const handlePageCountChange = React.useCallback((id: string, count: number) => {
    setPageCounts(prev => {
      if (prev[id] === count) return prev;
      return { ...prev, [id]: count };
    });
  }, []);

  // 1. Build the Ordered Sections Array
  const orderedSections: string[] = [];
  
  const customStages = audit.reportStructure?.customStages || [];
  const findingStages = findings.map(f => f.stage);
  const orderedStages = Array.from(new Set([...customStages, ...findingStages]));
    if (audit.pages && audit.pages.length > 0) {
      // Modular
      audit.pages.filter(p => !p.isHidden).forEach(p => {
        if (p.id === 'findings') {
          orderedStages.forEach(stage => {
            if (findings.some(f => f.stage === stage && !f.isPageBreak)) {
              orderedSections.push(`stage:${stage}`);
            }
          });
        } else {
          orderedSections.push(`page:${p.id}`);
          if (p.id === 'cover' || p.blocks?.some(b => b.type === 'Cover')) {
            orderedSections.push('toc');
          }
        }
      });
    } else {
      // Legacy
      orderedSections.push('page:cover');
      orderedSections.push('toc');
      orderedSections.push('executive-summary');
      orderedSections.push('paid-search-opportunities');
      orderedSections.push('seo-onboarding');
      orderedSections.push('recommended-setup');
      orderedSections.push('recommended-monthly');
      orderedSections.push('conclusion');
      
      orderedStages.forEach(stage => {
        if (findings.some(f => f.stage === stage)) {
          orderedSections.push(`stage:${stage}`);
        }
      });
    }

  // Calculate start pages
  const startPages: Record<string, number> = {};
  let currentStart = 1;
  for (const sectionId of orderedSections) {
    if (sectionId === 'page:cover' || sectionId === 'toc' || sectionId === 'page:thank-you') {
      // No page numbering for these
    } else {
      startPages[sectionId] = currentStart;
      currentStart += pageCounts[sectionId] || 1; // Default to 1 before rendered
    }
  }

  return (
    <div id="live-preview-container" className="flex gap-[20px] h-full items-start">
       {orderedSections.map(sectionId => {
         
         if (sectionId === 'toc') {
           return <TocBlock key={sectionId} audit={audit} sections={sections} pageCounts={pageCounts} orderedSections={orderedSections} />;
         }
         
         if (sectionId.startsWith('page:')) {
           const pageId = sectionId.split(':')[1];
           
           if (pageId === 'cover' && (!audit.pages || audit.pages.length === 0)) {
             return (
                <div key={sectionId} id={sectionId} className="w-[850px] shrink-0 min-h-[1100px] bg-[#0A0A0A] relative overflow-hidden">
                  <CoverBlock audit={audit} />
                </div>
             );
           }
           if (pageId === 'thank-you' && (!audit.pages || audit.pages.length === 0)) return null;

           const page = audit.pages?.find(p => p.id === pageId);
           if (!page) return null;

           const hasCoverBlock = page.blocks?.some(b => b.type === 'Cover');
           const hasThankYouBlock = page.blocks?.some(b => b.type === 'ThankYou');

           if (hasCoverBlock) {
             return (
                <div key={sectionId} id={sectionId} className="w-[850px] shrink-0 min-h-[1100px] bg-[#0A0A0A] relative overflow-hidden">
                  <CoverBlock audit={audit} />
                </div>
             );
           }

           if (hasThankYouBlock) {
             const thankYouData = page.blocks?.find(b => b.type === 'ThankYou')?.data;
             return (
                <div key={sectionId} id={sectionId} className="w-[850px] shrink-0 min-h-[1100px] bg-[#0A0A0A] relative overflow-hidden">
                  {thankYouData && <ThankYouBlock data={thankYouData} />}
                </div>
             );
           }

           const isDarkBackground = false; // Cover and Thank You are now handled above
           
           return (
             <PaginatedSection 
               key={sectionId}
               sectionId={sectionId}
               startPageNum={startPages[sectionId]}
               onPageCountChange={handlePageCountChange}
               isCover={false} 
               backgroundColor={(page as any).layout === 'split-focus' ? '#ffffff' : '#f4f5f7'}
               backgroundSVG={
                 (page as any).layout === 'split-focus' ? (pageIndex: number) => {
                   const heroBlock = page.blocks?.find((b: any) => b.type === 'HeroHeader');
                   const displayTitle = heroBlock?.data?.title || page.title;
                   const displaySubtitle = heroBlock?.data?.subtitle || "Our structured approach to ensuring long-term success and continuous growth.";
                   return (
                    <div className="absolute inset-0 w-full h-full pointer-events-none flex z-0">
                      <div className="w-[45%] h-full relative overflow-hidden border-r border-black/20 shadow-2xl">
                         <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to bottom right, #0A0A0A, #0A0A0A, #111326)' }}></div>
                         <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
                            <AbstractWaves variant="dark" noMask pattern="onboarding" />
                         </div>
                         {pageIndex === 0 && (
                           <div className="relative z-10 p-12 pt-32 pointer-events-auto">
                             <h2 className="text-[3rem] font-bold tracking-tight leading-[1.1] mb-8 text-white break-words">
                                {displayTitle}
                             </h2>
                             <div className="w-16 h-2 bg-[#0057FF] mb-6"></div>
                             <p className="text-white/60 text-lg whitespace-pre-wrap">{displaySubtitle}</p>
                           </div>
                         )}
                      </div>
                      <div className="w-[55%] h-full bg-white"></div>
                    </div>
                   );
                 } : page.id === 'conclusion' ? (
                   <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none z-0 text-[#0057FF] rotate-180">
                     <AbstractWaves variant="light" />
                   </div>
                 ) : page.id === 'recommended-monthly' ? (
                   <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none z-0 text-[#0057FF]">
                     <AbstractMesh variant="light" />
                   </div>
                 ) : page.id === 'thank-you' ? (
                   <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none z-0 text-[#0057FF] rotate-180">
                     <AbstractWaves variant="dark" noMask pattern="thankYou" />
                   </div>
                 ) : page.id === 'executive-summary' ? (
                   <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] text-[#0057FF]">
                     <div className="absolute top-[90px] left-[64px] flex items-center gap-4 opacity-40 z-0">
                       <div className="w-8 h-[3px] bg-[#0057FF]"></div>
                       <h3 className="text-[1.1rem] font-bold tracking-[0.3em] uppercase text-black">Executive Summary</h3>
                     </div>
                     <div className="absolute bottom-[-150px] left-[-250px] w-[1200px] h-[1200px] opacity-70 pointer-events-none z-0">
                       <AbstractWaves variant="light" noMask />
                     </div>
                   </div>
                 ) : undefined
               }
               renderCanvas={() => <AnnotationCanvas targetId={page.id} targetType="page" auditId={audit.id} drawMode={drawMode || 'cursor'} />}
             >
               {(page as any).layout === 'split-focus' ? (
                 <div className="w-[55%] ml-auto pt-2 pb-4 relative z-20">
                   <BlockRenderer audit={audit} blocks={page.blocks?.filter((b: any) => b.type !== 'HeroHeader') || []} />
                 </div>
               ) : (
                 <div className="w-full">
                   {/* Automatically force Grid Matrix on recommended-setup page if it's a ProcessSteps block */}
                   <BlockRenderer audit={audit} blocks={page.blocks?.map(b => 
                     b.type === 'ProcessSteps' && page.id === 'recommended-setup' 
                     ? { ...b, data: { ...b.data, variant: 'grid' } } 
                     : b
                   ) || []} />
                 </div>
               )}
             </PaginatedSection>
           );
         }

         // Legacy Routes
         if (sectionId === 'executive-summary') return <LegacyExecutiveSummary key={sectionId} audit={audit} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} />;
         if (sectionId === 'paid-search-opportunities') return <LegacyPaidSearch key={sectionId} audit={audit} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} />;
         if (sectionId === 'seo-onboarding') return <LegacySeoOnboarding key={sectionId} audit={audit} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} />;
         if (sectionId === 'recommended-setup') return <LegacyRecommendedSetup key={sectionId} audit={audit} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} />;
         if (sectionId === 'recommended-monthly') return <LegacyRecommendedMonthly key={sectionId} audit={audit} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} />;
         if (sectionId === 'conclusion') return <LegacyConclusion key={sectionId} audit={audit} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} />;
         
         if (sectionId.startsWith('stage:')) {
           const stageName = sectionId.split(':')[1];
           const stageFindings = findings.filter(f => f.stage === stageName);
           if (stageFindings.filter(f => !f.isPageBreak).length === 0) return null;
           return <LegacyStageBlock key={sectionId} audit={audit} stageName={stageName} findings={stageFindings} sectionId={sectionId} startPageNum={startPages[sectionId]} onPageCountChange={handlePageCountChange} onFindingSelect={onFindingSelect} drawMode={drawMode} />;
         }

         return null;
       })}
    </div>
  );
}
