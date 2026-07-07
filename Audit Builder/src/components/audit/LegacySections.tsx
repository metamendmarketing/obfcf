/**
 * @file LegacySections.tsx
 * @description Components responsible for rendering the classic "legacy" audit architecture.
 * These components are used for audits created prior to the modular Block Architecture.
 * They rely on `audit.reportStructure` rather than `audit.pages` and `audit.blocks`.
 * 
 * NOTE: The `PaginatedSection` wrapper (provided by LivePreview) manages the exact
 * vertical flow and column breaks of these components during PDF generation.
 */
import React, { useRef, useState } from 'react';
import { useStore, Audit, Finding } from "@/lib/store";
import { AbstractWaves } from "../ui/AbstractWaves";
import { AbstractMesh } from "../ui/AbstractMesh";
import { PaginatedSection } from "./LivePreview";
import { DEFAULT_CONCLUSION } from "@/lib/constants";
import { AnnotationCanvas } from "./AnnotationCanvas";

const InteractiveWrapper = ({ 
  finding, findingId, updateFinding, type, initialX, initialY, initialWidth, containerWidth, align, className, style, children 
}: any) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0, startX: 0, startY: 0, startWidth: 0 });
  const isPresentation = typeof window !== 'undefined' && document.getElementById('presentation-preview-wrapper') !== null;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentLayout = finding.layoutType || 'image-left';
    let newLayout = currentLayout;
    if (currentLayout === 'legacy-box-left') newLayout = 'legacy-box-right';
    else if (currentLayout === 'legacy-box-right') newLayout = 'legacy-box-left';
    else if (currentLayout === 'legacy-box-top') newLayout = 'legacy-box-bottom';
    else if (currentLayout === 'legacy-box-bottom') newLayout = 'legacy-box-top';
    else if (currentLayout === 'image-left') newLayout = 'image-right';
    else if (currentLayout === 'image-right') newLayout = 'image-left';
    updateFinding(findingId, { layoutType: newLayout });
  };

  const onPointerDown = (e: React.PointerEvent, action: 'drag' | 'resize') => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/present')) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    
    // Dispatch custom event to select finding in sidebar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('selectFinding', { detail: findingId }));
    }
    
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Calculate the current CSS scale/zoom applied to the preview container
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const scale = rect.width / target.offsetWidth || 1;
    
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: Number(initialX),
      startY: Number(initialY),
      startWidth: Number(initialWidth)
    };

    let rafId: number | null = null;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (rafId) return; // throttle to screen refresh rate
      
      rafId = requestAnimationFrame(() => {
        rafId = null;
        // Adjust dx and dy by the scale factor so it tracks the mouse perfectly
        const dx = (moveEvent.clientX - dragStart.current.x) / scale;
        const dy = (moveEvent.clientY - dragStart.current.y) / scale;
        
        if (action === 'drag') {
          const fieldX = type === 'box' ? 'horizontalOffset' : type === 'table' ? 'tableHorizontalOffset' : type === 'image3' ? 'image3HorizontalOffset' : type === 'image2' ? 'image2HorizontalOffset' : type === 'businessImpact' ? 'businessImpactHorizontalOffset' : type === 'recommendation' ? 'recommendationHorizontalOffset' : 'imageHorizontalOffset';
          const fieldY = type === 'box' ? 'verticalOffset' : type === 'table' ? 'tableVerticalOffset' : type === 'image3' ? 'image3VerticalOffset' : type === 'image2' ? 'image2VerticalOffset' : type === 'businessImpact' ? 'businessImpactVerticalOffset' : type === 'recommendation' ? 'recommendationVerticalOffset' : 'imageVerticalOffset';
          updateFinding(findingId, { [fieldX]: dragStart.current.startX + dx, [fieldY]: dragStart.current.startY + dy });
        } else if (action === 'resize') {
          const fieldW = type === 'box' ? 'boxWidth' : type === 'table' ? 'tableWidth' : type === 'image3' ? 'image3Width' : type === 'image2' ? 'image2Width' : type === 'businessImpact' ? 'businessImpactWidth' : type === 'recommendation' ? 'recommendationWidth' : 'imageWidth';
          // If align is right, the right edge is anchored. 
          // We put the handle on the left edge, so dragging left (negative dx) increases width!
          const adjustedDx = align === 'right' ? -dx : dx;
          let newWidth = dragStart.current.startWidth + (adjustedDx / containerWidth * 100);
          newWidth = Math.max(10, Math.min(100, newWidth));
          updateFinding(findingId, { [fieldW]: newWidth });
        }
      });
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      cleanup();
    };

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      target.removeEventListener('pointermove', onPointerMove as EventListener);
      target.removeEventListener('pointerup', onPointerUp as EventListener);
      target.removeEventListener('pointercancel', cleanup as EventListener);
      target.removeEventListener('lostpointercapture', cleanup as EventListener);
      delete (target as any)._dragCleanup;
    };

    if ((target as any)._dragCleanup) {
      (target as any)._dragCleanup();
    }
    (target as any)._dragCleanup = cleanup;

    target.addEventListener('pointermove', onPointerMove as EventListener);
    target.addEventListener('pointerup', onPointerUp as EventListener);
    target.addEventListener('pointercancel', cleanup as EventListener);
    target.addEventListener('lostpointercapture', cleanup as EventListener);
  };

  return (
    <div 
      className={`group ${className}`} 
      style={{ ...style, cursor: isPresentation ? 'default' : 'grab', zIndex: (isHovered && !isPresentation) ? 50 : style?.zIndex }}
      onPointerDown={(e) => {
        if (!isPresentation) onPointerDown(e, 'drag');
      }}
      onMouseEnter={() => {
        if (!isPresentation) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (!isPresentation) setIsHovered(false);
      }}
    >
      {children}
      {/* Removed the absolute inset-0 border child because it fragments across columns and causes ghost borders.
          Instead, we apply hover borders or outlines directly to the physical elements. */}
      
      {type === 'box' && (
        <button 
          className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-bold px-2 py-1 shadow-md rounded opacity-0 group-hover:opacity-100 print:hidden data-html2canvas-ignore z-50 transition-opacity hover:bg-gray-800 cursor-pointer"
          onClick={handleFlip}
          onPointerDown={(e) => e.stopPropagation()} // prevent drag when clicking button
        >
          Flip Layout
        </button>
      )}

      <div 
        className={`absolute bottom-0 ${align === 'right' ? 'left-0 rounded-tr-lg cursor-sw-resize' : 'right-0 rounded-tl-lg cursor-se-resize'} w-6 h-6 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden data-html2canvas-ignore z-50`}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPointerDown(e, 'resize');
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          {align === 'right' ? (
            <>
              <path d="M3 15v6h6"/><path d="M3 21l7-7"/>
            </>
          ) : (
            <>
              <path d="M21 15v6h-6"/><path d="M21 21l-7-7"/>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export const LegacyExecutiveSummary = ({ audit, sectionId, startPageNum, onPageCountChange }: any) => {
  const executiveSummary = audit.reportStructure?.executiveSummary || '';
  return (
    <PaginatedSection 
      sectionId={sectionId} startPageNum={startPageNum} onPageCountChange={onPageCountChange}
      backgroundColor="#f8f9fa"
      backgroundSVG={
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] text-[#0057FF]">
          <div className="absolute top-[90px] left-[64px] flex items-center gap-4 opacity-40 z-0">
            <div className="w-8 h-[3px] bg-[#0057FF]"></div>
            <h3 className="text-[1.1rem] font-bold tracking-[0.3em] uppercase text-black">Executive Summary</h3>
          </div>
          <div className="absolute bottom-[-150px] left-[-250px] w-[1200px] h-[1200px] opacity-70 pointer-events-none z-0">
            <AbstractWaves variant="light" noMask />
          </div>
        </div>
      }
    >
      <div className="flex flex-col w-full relative z-10 p-16 pb-24">
         <div className="mb-12">
            <div className="w-24 h-2 bg-[#0057FF] mb-6"></div>
            <h2 className="text-[3.5rem] font-bold text-black leading-tight tracking-tight">
               Creating the Right Conditions<br/>for Growth
            </h2>
         </div>
         <div className="font-sans text-[1.1rem] leading-[1.7] text-black prose prose-gray prose-headings:text-black prose-a:text-[#0057FF] prose-img:m-0 prose-img:inline-block max-w-none w-full">
           <div dangerouslySetInnerHTML={{ __html: executiveSummary }} />
         </div>
      </div>
    </PaginatedSection>
  );
};

export const LegacyPaidSearch = ({ audit, sectionId, startPageNum, onPageCountChange }: any) => {
  return (
    <PaginatedSection sectionId={sectionId} startPageNum={startPageNum} onPageCountChange={onPageCountChange} backgroundColor="#f0f2f5">
      <div className="flex flex-col w-full relative z-10 px-0">
         <div className="w-[90%] ml-auto bg-[#222] text-white p-12 shadow-2xl relative z-20">
            <h1 className="text-[3.2rem] font-bold tracking-tight leading-tight">{audit.reportStructure?.customHeadings?.paidSearchOpportunities || "Paid Search Strategic Opportunities"}</h1>
            <h2 className="text-[1.8rem] text-white/80 mt-2 font-normal">The Growth Horizon From Here</h2>
         </div>
         <div className="w-[85%] ml-auto bg-[#d8dbde] mt-8 p-10 shadow-xl relative z-20 border-l-[6px] border-[#0057FF]">
            <h3 className="text-[1.7rem] font-bold text-[#222] mb-4" dangerouslySetInnerHTML={{ __html: audit.reportStructure?.paidSearchData?.panelTitle ?? "Growth Is On Your Side, and Competitors<br/>Have Yet to Catch Up" }} />
            <div className="border-l-[4px] border-[#0057FF] pl-6 py-1">
              <p className="text-[1.1rem] text-[#333] mb-4" dangerouslySetInnerHTML={{ __html: audit.reportStructure?.paidSearchData?.panelText1 ?? "Sealeze's current landscape presents a strong opportunity to capture paid<br/>placements that competitors are overlooking." }} />
              <p className="text-[1.1rem] text-[#333]" dangerouslySetInnerHTML={{ __html: audit.reportStructure?.paidSearchData?.panelText2 ?? "Through a focused competitive analysis, we've identified a <strong class=\"text-black\">2-part strategy</strong> to<br/>strengthen and expand your paid search performance." }} />
            </div>
         </div>
         <div className="px-16 mt-16 z-20">
            <h2 className="text-[2.2rem] font-bold text-black mb-6">{audit.reportStructure?.paidSearchData?.step1Title ?? "Step 1: Competitive Keyword Analysis"}</h2>
            <div className="border-l-[4px] border-[#0057FF] pl-6 mb-10">
               <p className="text-[1.1rem] text-[#333] mb-4 max-w-4xl">{audit.reportStructure?.paidSearchData?.step1Text1 ?? "Lower cost-per-click estimates across key terms suggest there's room to capture high-intent searches without overspending. Focusing on these queries gives Sealeze a practical way to drive more qualified traffic and meaningful conversions."}</p>
               <p className="text-[1.1rem] font-bold text-black">See examples below. For the full spreadsheet click <a href="#" className="text-[#0057FF] underline underline-offset-2">here</a></p>
            </div>
         </div>
         <div className="w-full bg-white px-16 py-12 shadow-inner border-t-[3px] border-[#000]">
            <div className="flex justify-between gap-12">
               <div className="w-1/2">
                  <h3 className="text-[1.3rem] font-bold text-black mb-4 uppercase tracking-wide">Sealeze Branded</h3>
                  <table>
                     <thead>
                        <tr>
                           <th>Keyword</th>
                           <th>Monthly<br/>Volume</th>
                           <th>CPC<br/>(USD)</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr><td>sealeze</td><td>110</td><td>0</td></tr>
                        <tr><td>sealeze brush seal</td><td>20</td><td>0</td></tr>
                        <tr><td>sealeze brush holder</td><td>20</td><td>0</td></tr>
                        <tr><td>sealeze brush</td><td>20</td><td>2.34</td></tr>
                        <tr><td>sealeze brush seals</td><td>20</td><td>0</td></tr>
                        <tr><td>sealeze catalog</td><td>20</td><td>0</td></tr>
                     </tbody>
                  </table>
               </div>
               <div className="w-1/2">
                  <h3 className="text-[1.3rem] font-bold text-black mb-4 uppercase tracking-wide">Nylon Brushes</h3>
                  <table>
                     <thead>
                        <tr>
                           <th>Keyword</th>
                           <th>Monthly<br/>Volume</th>
                           <th>CPC<br/>(USD)</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr><td>nylon abrasive filament brushes</td><td>90</td><td>1.34</td></tr>
                        <tr><td>nylon strip brush</td><td>50</td><td>1.93</td></tr>
                        <tr><td>nylon strip brushes</td><td>40</td><td>1.93</td></tr>
                        <tr><td>flexible nylon strip brush</td><td>20</td><td>0.97</td></tr>
                        <tr><td>nylon cylinder brush</td><td>20</td><td>0.82</td></tr>
                        <tr><td>nylon disc brush</td><td>20</td><td>0</td></tr>
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
         <div className="w-[85%] mx-auto h-px bg-black/10 my-16"></div>
         <div className="px-16 z-20">
            <h2 className="text-[2.2rem] font-bold text-black mb-6">{audit.reportStructure?.paidSearchData?.step2Title ?? "Step 2: Landing Page Optimization"}</h2>
            <div className="border-l-[4px] border-[#0057FF] pl-6 mb-12">
               <p className="text-[1.1rem] text-[#333] mb-4 max-w-4xl">{audit.reportStructure?.paidSearchData?.step2Text1 ?? "A review of competitor ads triggered by queries like \"strip brushes\" shows relatively limited competition in paid search. Note however that to fully capitalize on this gap, product pages must be properly optimized to support conversion and Quality Score."}</p>
               <p className="text-[1.1rem] text-[#333] max-w-4xl">{audit.reportStructure?.paidSearchData?.step2Text2 ?? "Below are examples of competitor pages against which Sealeze's current pages already demonstrate a competitive advantage."}</p>
            </div>
            <div className="flex flex-col gap-16 mt-8">
               <div className="flex gap-12 items-start">
                  <div className="w-[45%] relative pt-4">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="absolute -left-14 top-0 text-[#0057FF]"><path d="M7 7l10 10m0 0V7m0 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     <h3 className="text-[1.7rem] font-bold text-black mb-4 underline decoration-[#222] underline-offset-[6px] decoration-2">Spiral Brushes Inc</h3>
                     <p className="text-[1.1rem] text-[#333] leading-relaxed">Outdated site design with poor user interface undermines brand trust, as <a href="#" className="text-[#0057FF] font-bold">Stanford research</a> shows <strong className="text-black">75% of users judge credibility based on visuals alone</strong>, leaving little opportunity for customers to actually convert.</p>
                  </div>
                  <div className="w-[55%] border border-[#0057FF] shadow-xl bg-white p-1 transform rotate-1">
                     <img src={audit.reportStructure?.paidSearchData?.competitors?.[0]?.imageUrl || "https://placehold.co/800x500/ee0000/ffffff?text=Spiral+Brushes+Website+Mockup"} alt="Spiral Brushes" className="w-full h-auto border border-gray-200" />
                  </div>
               </div>
               <div className="flex gap-12 items-start mt-8">
                  <div className="w-[55%] border border-[#0057FF] shadow-xl bg-white p-1 transform -rotate-1">
                     <img src={audit.reportStructure?.paidSearchData?.competitors?.[1]?.imageUrl || "https://placehold.co/800x500/ffffff/000000?text=Bolex+Brush+Website+Mockup"} alt="Bolex Brushes" className="w-full h-auto border border-gray-200" />
                  </div>
                  <div className="w-[45%] relative pt-4 text-right">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="absolute -right-14 top-0 text-[#0057FF]"><path d="M17 17L7 7m0 0v10m0-10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     <h3 className="text-[1.7rem] font-bold text-black mb-4 underline decoration-[#222] underline-offset-[6px] decoration-2">Bolex Brushes</h3>
                     <p className="text-[1.1rem] text-[#333] leading-relaxed text-left">While the page is relatively well optimized, it contains low-resolution images, an intrusive chatbot, and inconsistent spacing. These friction points collectively suggest the page may be underperforming from a user experience and conversion standpoint.</p>
                  </div>
               </div>
            </div>
            <div className="border-l-[6px] border-[#0057FF] pl-6 mt-16 bg-[#e2e2e2] p-8 shadow-sm">
               <p className="text-[1.15rem] text-[#333] leading-relaxed font-medium">{audit.reportStructure?.paidSearchData?.conclusionText ?? "Given the current quality of competitor ads, Sealeze is well positioned to launch a search campaign that outperforms the field. With a few targeted landing page adjustments, the brand could convert that advantage into measurable gains."}</p>
            </div>
            {audit.reportStructure?.paidSearchOpportunities && audit.reportStructure.paidSearchOpportunities !== "<p></p>" && (
               <div className="mt-16 font-sans text-[1.1rem] leading-[1.7] text-black prose prose-gray prose-headings:text-black prose-a:text-[#0057FF] prose-img:m-0 prose-img:inline-block max-w-none w-full">
                 <div dangerouslySetInnerHTML={{ __html: audit.reportStructure.paidSearchOpportunities }} />
               </div>
            )}
         </div>
      </div>
    </PaginatedSection>
  );
};

export const LegacySeoOnboarding = ({ audit, sectionId, startPageNum, onPageCountChange }: any) => {
  console.log("Rendering Concept 3 SEO Onboarding");
  return (
    <PaginatedSection 
      sectionId={sectionId} 
      startPageNum={startPageNum} 
      onPageCountChange={onPageCountChange} 
      backgroundColor="#ffffff"
      backgroundSVG={(pageIndex: number) => (
        <div className="absolute inset-0 w-full h-full pointer-events-none flex z-0">
          <div className="w-[40%] h-full relative overflow-hidden border-r border-black/20 shadow-2xl">
             <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to bottom right, #0A0A0A, #0A0A0A, #111326)' }}></div>
             <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
                <AbstractWaves variant="dark" noMask pattern="onboarding" />
             </div>
             {pageIndex === 0 && (
               <div className="relative z-10 p-12 pt-32 pointer-events-auto">
                 <h2 className="text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-8 text-white">
                    {audit.reportStructure?.customHeadings?.seoOnboarding || "SEO Onboarding Framework"}
                 </h2>
                 <div className="w-16 h-2 bg-[#0057FF] mb-6"></div>
                 <p className="text-white/60 text-lg">{audit.reportStructure?.customHeadings?.seoOnboardingSubtext || "Our structured approach to ensuring long-term success and continuous growth."}</p>
               </div>
             )}
          </div>
          <div className="w-[60%] h-full bg-white"></div>
        </div>
      )}
    >
      <div className="w-[60%] ml-auto pl-10 pr-12 pt-8 pb-4 relative z-20">
         <div className="concept-3-styles w-full">
            <div dangerouslySetInnerHTML={{ __html: audit.reportStructure?.seoOnboarding || `<ol><li><p><strong>Client Insights</strong></p></li><li><p><strong>Quick Win Audit</strong></p></li><li><p><strong>Keyword Research</strong></p></li><li><p><strong>Initial Conversion Tracking</strong></p></li><li><p><strong>Reporting</strong></p></li></ol>` }} />
         </div>
      </div>
    </PaginatedSection>
  );
};

export const LegacyRecommendedSetup = ({ audit, sectionId, startPageNum, onPageCountChange }: any) => {
  return (
    <PaginatedSection sectionId={sectionId} startPageNum={startPageNum} onPageCountChange={onPageCountChange} backgroundColor="#f4f5f7">
      <div className="flex flex-col w-full relative z-10 p-16 pb-24">
         <div className="mb-12">
            <div className="w-24 h-2 bg-[#0057FF] mb-6"></div>
            <h2 className="text-[3rem] font-bold text-black leading-tight tracking-tight">
               {audit.reportStructure?.customHeadings?.recommendedSetup || "Recommended Organic SEO Setup"}
            </h2>
         </div>
         <div className="font-sans text-[1.1rem] leading-[1.7] text-black prose prose-gray prose-headings:text-black prose-a:text-[#0057FF] prose-img:m-0 prose-img:inline-block max-w-none w-full bg-white p-12 shadow-xl border border-black/5">
           <div dangerouslySetInnerHTML={{ __html: audit.reportStructure?.recommendedSetup || `<p class="text-gray-400 italic">Add content in the editor to see it here.</p>` }} />
         </div>
      </div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none z-0 text-[#0057FF] rotate-180">
         <AbstractWaves variant="light" />
      </div>
    </PaginatedSection>
  );
};

export const LegacyRecommendedMonthly = ({ audit, sectionId, startPageNum, onPageCountChange }: any) => {
  return (
    <PaginatedSection 
      sectionId={sectionId} startPageNum={startPageNum} onPageCountChange={onPageCountChange}
      backgroundColor="#f0f2f5"
      backgroundSVG={
        <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none z-0 text-[#0057FF]">
          <AbstractMesh variant="light" />
        </div>
      }
    >
      <div className="flex flex-col w-full relative z-10 px-0 pt-2">
         <div className="w-[95%] mr-auto bg-[#1a1a1a] text-white pl-16 pr-12 py-4 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.75)] relative z-20">
            <h2 className="text-[2.5rem] font-bold mb-1 tracking-tight">{audit.reportStructure?.customHeadings?.recommendedMonthly || "Recommended Monthly SEO Services"}</h2>
            <p className="text-[1.05rem] text-white/80 max-w-3xl leading-snug">
               Below are our suggested organic monthly optimizations; however, this list is not exhaustive, and we can often incorporate new initiatives. How we spend our time each month is your choice.
            </p>
         </div>
         <div className="px-16 mt-2 pb-4 relative z-10">
            <div className="monthly-list-styles font-sans w-full">
               <div dangerouslySetInnerHTML={{ __html: audit.reportStructure?.recommendedMonthly || `<ol><li><p><strong>Continued keyword research</strong></p></li></ol>` }} />
            </div>
         </div>
      </div>
    </PaginatedSection>
  );
};

export const LegacyConclusion = ({ audit, sectionId, startPageNum, onPageCountChange }: any) => {
  return (
    <PaginatedSection 
      sectionId={sectionId} startPageNum={startPageNum} onPageCountChange={onPageCountChange}
      backgroundColor="#f4f5f7"
      backgroundSVG={
        <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none z-0 text-[#0057FF] rotate-180">
          <AbstractWaves variant="light" />
        </div>
      }
    >
      <div className="flex flex-col w-full relative z-10 px-0 pt-8">
         <div className="w-[92%] mr-auto bg-[#1a1a1a] text-white pl-16 pr-12 py-6 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.75)] relative z-20">
            <h2 className="text-[2.4rem] font-bold mb-2 tracking-tight">{audit.reportStructure?.customHeadings?.conclusion || "Conclusion"}</h2>
            <p className="text-[1.05rem] text-white/80 max-w-4xl leading-snug">
               {audit.reportStructure?.customHeadings?.conclusionSubtext || "You've scaled the platform. Now let's scale how it's seen."}
            </p>
         </div>
         <div className="px-16 pb-8 z-20" style={{ paddingTop: '48px' }}>
            <div className="font-sans text-[1.08rem] leading-[1.6] text-[#111] prose-report w-full">
               <div dangerouslySetInnerHTML={{ __html: (!audit.reportStructure?.conclusion || audit.reportStructure.conclusion === '<p></p>' || audit.reportStructure.conclusion.includes('Your brand operates in a market')) ? DEFAULT_CONCLUSION : audit.reportStructure.conclusion }} />
            </div>
         </div>
      </div>
    </PaginatedSection>
  );
};

export const LegacyStageBlock = ({ audit, stageName, findings, sectionId, startPageNum, onPageCountChange, drawMode }: any) => {
  const updateFinding = useStore((state) => state.updateFinding);
  const stageConfig = audit.reportStructure?.stageConfigs?.[stageName] || {};
  const heading = stageConfig.heading || stageName;
  const caption = stageConfig.caption;

  return (
    <PaginatedSection sectionId={sectionId} startPageNum={startPageNum} onPageCountChange={onPageCountChange} backgroundColor="#f4f5f7">
      <div className="px-12 pt-4 pb-8">
        
        {/* Stage Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-[0.2em] text-gray-400 uppercase">{stageName}</h2>
          <div className="mt-1 flex items-end gap-3 border-b-[3px] border-black pb-2 inline-flex">
            <h1 className="text-3xl font-black text-black tracking-tight">{heading}</h1>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0057FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <line x1="7" y1="7" x2="17" y2="17"></line>
              <polyline points="17 7 17 17 7 17"></polyline>
            </svg>
          </div>
          {caption && (
            <div className="mt-5 border-l-4 border-[#0057FF] pl-5 py-0.5">
              <p className="text-lg text-black font-sans leading-relaxed">{caption}</p>
            </div>
          )}
        </div>

        {/* Findings List */}
        <div className="flex flex-col gap-6">
          {(() => {
            let findingCounter = 0;
            return findings.map((finding: any, idx: number) => {
              if (finding.isPageBreak) {
                return (
                  <div 
                    key={finding.id} 
                    className="break-before-column h-0 w-full"
                  ></div>
                );
              }

              findingCounter++;
              const num = String(findingCounter).padStart(2, '0');
              const mainImage = finding.imageUrls?.[0] || finding.imageUrl;
            
            const isDark = finding.boxColor !== 'light';
            const boxClasses = isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-black border border-black/10 shadow-2xl";
            const numberClasses = isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-black border border-black/10 shadow-md";
            const titleClasses = isDark ? "text-white" : "text-black";
            const bodyClasses = isDark ? "text-gray-300" : "text-gray-700";

            // Determine default values based on layout type if not explicitly set
            let defaultWidth = 60;
            let defaultVertical = -64;
            
            if (finding.layoutType === 'legacy-box-top') {
              defaultWidth = 85;
              defaultVertical = -40;
            } else if (finding.layoutType === 'legacy-box-bottom') {
              defaultWidth = 100;
              defaultVertical = 0;
            }

            const boxWidth = finding.boxWidth ?? defaultWidth;
            let actualVerticalOffset = finding.verticalOffset ?? defaultVertical;
            const horizontalOffset = finding.horizontalOffset ?? 0;
            const useGridTopAnchor = !finding.layoutType || finding.layoutType === 'legacy-box-right' || finding.layoutType === 'image-left' || finding.layoutType === 'gallery' || finding.layoutType === 'legacy-box-left';
            
            // Seamlessly migrate existing findings that used the old bottom-anchor default (-64px)
            if (useGridTopAnchor && actualVerticalOffset === -64) {
              actualVerticalOffset = 32;
            }

            const boxAlign = (finding.layoutType === 'image-left' || finding.layoutType === 'legacy-box-right') ? 'right' : 'left';
            
            // Allow full CSS left/right freedom to push past the anchor boundaries
            const boxStyle: React.CSSProperties = {
              width: `${boxWidth}%`,
              transform: `translateY(${actualVerticalOffset}px)`,
              left: boxAlign === 'left' ? `${horizontalOffset}px` : undefined,
              right: boxAlign === 'right' ? `${-horizontalOffset}px` : undefined,
            };

            // Image Styling Logic
            let defaultImageWidth = 75;
            if (finding.layoutType === 'legacy-box-top' || finding.layoutType === 'legacy-box-bottom') {
              defaultImageWidth = 90;
            }

            let defaultImageAlign = 'right';
            if (finding.layoutType === 'image-left' || finding.layoutType === 'legacy-box-right' || finding.layoutType === 'legacy-box-bottom' || finding.layoutType === 'gallery') {
              defaultImageAlign = 'flex-start';
            } else {
              defaultImageAlign = 'flex-end';
            }

            const imgAlign = finding.imageAlignment || (defaultImageAlign === 'flex-start' ? 'left' : 'right');
            const alignSelfMap: any = { left: 'flex-start', center: 'center', right: 'flex-end' };

            const imgVerticalOffset = finding.imageVerticalOffset ?? 0;
            const imgHorizontalOffset = finding.imageHorizontalOffset ?? 0;
            const imgWidth = finding.imageWidth ?? defaultImageWidth;

            // Allow full image translation freedom 
            const imageStyle: React.CSSProperties = {
              position: 'absolute', // Detach from document flow so height doesn't push next finding
              width: `${imgWidth}%`,
              transform: `translateY(${imgVerticalOffset}px)`,
              left: imgAlign === 'left' ? `${imgHorizontalOffset}px` : undefined,
              right: imgAlign === 'right' ? `${-imgHorizontalOffset}px` : undefined,
              ...(imgAlign === 'center' && { marginLeft: `${imgHorizontalOffset}px` }),
              ...(useGridTopAnchor 
                  ? { alignSelf: 'flex-start', justifySelf: alignSelfMap[imgAlign] }
                  : { alignSelf: alignSelfMap[imgAlign] })
            };
            
            const secondaryImage = finding.imageUrls && finding.imageUrls.length > 1 ? finding.imageUrls[1] : null;
            const secondaryImageNode = secondaryImage && finding.layoutType !== 'gallery' ? (
              <div className="absolute inset-0 pointer-events-none z-0">
                <InteractiveWrapper
                  finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image2"
                  initialX={finding.image2HorizontalOffset ?? 50} initialY={finding.image2VerticalOffset ?? 50} initialWidth={finding.image2Width ?? 30} containerWidth={754} align="right"
                  className="pointer-events-auto"
                  style={{
                    position: 'absolute',
                    width: `${finding.image2Width ?? 30}%`,
                    transform: `translateY(${finding.image2VerticalOffset ?? 50}px)`,
                    left: `${finding.image2HorizontalOffset ?? 50}px`,
                  }}
                >
                  <img src={secondaryImage} alt="Secondary Evidence" draggable="false" className="w-full h-auto object-contain max-h-[350px] pointer-events-auto bg-white p-1 shadow-2xl border-2 border-[#0057FF]/40 outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50" />
                </InteractiveWrapper>
              </div>
            ) : null;

            const tertiaryImage = finding.imageUrls && finding.imageUrls.length > 2 ? finding.imageUrls[2] : null;
            const tertiaryImageNode = tertiaryImage && finding.layoutType !== 'gallery' ? (
              <div className="absolute inset-0 pointer-events-none z-0">
                <InteractiveWrapper
                  finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image3"
                  initialX={finding.image3HorizontalOffset ?? 50} initialY={finding.image3VerticalOffset ?? 200} initialWidth={finding.image3Width ?? 30} containerWidth={754} align="right"
                  className="pointer-events-auto"
                  style={{
                    position: 'absolute',
                    width: `${finding.image3Width ?? 30}%`,
                    transform: `translateY(${finding.image3VerticalOffset ?? 200}px)`,
                    left: `${finding.image3HorizontalOffset ?? 50}px`,
                  }}
                >
                  <img src={tertiaryImage} alt="Tertiary Evidence" draggable="false" className="w-full h-auto object-contain max-h-[350px] pointer-events-auto bg-white p-1 shadow-2xl border-2 border-[#0057FF]/40 outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50" />
                </InteractiveWrapper>
              </div>
            ) : null;

            // Layout Engine
            let layoutContent = null;

            if (finding.layoutType === 'gallery' && finding.imageUrls && finding.imageUrls.length > 1) {
              layoutContent = (
                <div className="grid grid-cols-1 relative w-full items-start">
                  <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image"
                      initialX={imgHorizontalOffset} initialY={imgVerticalOffset} initialWidth={imgWidth} containerWidth={754} align={imgAlign}
                      className="col-start-1 row-start-1 relative z-0"
                      style={imageStyle}
                  >
                     <div className="grid grid-cols-2 gap-2 pointer-events-auto bg-white p-2 rounded-lg shadow-xl border border-[#0057FF]/30 overflow-hidden outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50">
                       {finding.imageUrls.map((img: string, i: number) => (
                         <div key={i} className="w-full h-48 overflow-hidden rounded relative group pointer-events-none">
                           <img src={img} alt={`Evidence ${i+1}`} draggable="false" className="w-full h-full object-cover transition-transform group-hover:scale-105 pointer-events-auto" />
                         </div>
                       ))}
                     </div>
                  </InteractiveWrapper>
                  <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="box"
                      initialX={horizontalOffset} initialY={actualVerticalOffset} initialWidth={boxWidth} containerWidth={754} align={boxAlign}
                      className={`col-start-1 row-start-1 p-3 relative z-30 ${boxClasses}`}
                      style={{ ...boxStyle, justifySelf: 'flex-end', alignSelf: 'flex-start' }}
                  >
                    <div className={`absolute top-0 -right-14 w-12 h-12 flex items-center justify-center font-bold text-2xl ${numberClasses}`}>
                      {num}
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${titleClasses}`}>{finding.polishedTitle || finding.title}</h3>
                    <div className="font-sans text-[0.95rem] leading-[1.6]">
                      <div className={`font-sans font-semibold mb-2 prose max-w-none ${titleClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedSummary || "" }} />
                      <div className={`prose max-w-none ${bodyClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedBody || finding.rawNotes || "" }} />
                    </div>
                  </InteractiveWrapper>
                </div>
              );
            } else if (finding.layoutType === 'image-left' || finding.layoutType === 'legacy-box-right') {
              layoutContent = (
                <div className="grid grid-cols-1 relative w-full items-start">
                  {secondaryImageNode}
                  {tertiaryImageNode}
                  {mainImage && (
                    <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image"
                      initialX={imgHorizontalOffset} initialY={imgVerticalOffset} initialWidth={imgWidth} containerWidth={754} align={imgAlign}
                      className="col-start-1 row-start-1 relative z-0"
                      style={imageStyle}
                    >
                      <img src={mainImage} alt="Evidence" draggable="false" className="w-full h-auto object-contain pointer-events-auto bg-white p-1 border-2 border-[#0057FF]/30 shadow-lg outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50" />
                    </InteractiveWrapper>
                  )}
                  <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="box"
                      initialX={horizontalOffset} initialY={actualVerticalOffset} initialWidth={boxWidth} containerWidth={754} align={boxAlign}
                      className={`col-start-1 row-start-1 p-3 relative z-30 ${boxClasses}`}
                      style={{ ...boxStyle, justifySelf: 'flex-end', alignSelf: 'flex-start' }}
                  >
                    <div className={`absolute top-0 -right-14 w-12 h-12 flex items-center justify-center font-bold text-2xl ${numberClasses}`}>
                      {num}
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${titleClasses}`}>{finding.polishedTitle || finding.title}</h3>
                    <div className="font-sans text-[0.95rem] leading-[1.6]">
                      <div className={`font-sans font-semibold mb-2 prose max-w-none ${titleClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedSummary || "" }} />
                      <div className={`prose max-w-none ${bodyClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedBody || finding.rawNotes || "" }} />
                    </div>
                  </InteractiveWrapper>
                </div>
              );
            } else if (finding.layoutType === 'legacy-box-top') {
              layoutContent = (
                <div className="grid grid-cols-1 relative w-full items-start">
                  {secondaryImageNode}
                  {tertiaryImageNode}
                  {mainImage && (
                    <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image"
                      initialX={imgHorizontalOffset} initialY={imgVerticalOffset} initialWidth={imgWidth} containerWidth={754} align={imgAlign}
                      className="col-start-1 row-start-1 relative z-0"
                      style={imageStyle}
                    >
                      <img src={mainImage} alt="Evidence" draggable="false" className="w-full h-auto object-contain pointer-events-auto bg-white p-1 border-2 border-[#0057FF]/30 shadow-lg outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50" />
                    </InteractiveWrapper>
                  )}
                  <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="box"
                      initialX={horizontalOffset} initialY={actualVerticalOffset} initialWidth={boxWidth} containerWidth={754} align={boxAlign}
                      className={`col-start-1 row-start-1 p-3 relative z-30 ${boxClasses}`}
                      style={{ ...boxStyle, justifySelf: 'flex-start', alignSelf: 'flex-start' }}
                  >
                    <div className={`absolute top-0 -left-14 w-12 h-12 flex items-center justify-center font-bold text-2xl ${numberClasses}`}>
                      {num}
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${titleClasses}`}>{finding.polishedTitle || finding.title}</h3>
                    <div className="font-sans text-[0.95rem] leading-[1.6]">
                      <div className={`font-sans font-semibold mb-2 prose max-w-none ${titleClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedSummary || "" }} />
                      <div className={`prose max-w-none ${bodyClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedBody || finding.rawNotes || "" }} />
                    </div>
                  </InteractiveWrapper>
                </div>
              );
            } else if (finding.layoutType === 'legacy-box-bottom') {
               layoutContent = (
                <div className="grid grid-cols-1 relative w-full items-start">
                  {secondaryImageNode}
                  {tertiaryImageNode}
                  {mainImage && (
                    <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image"
                      initialX={imgHorizontalOffset} initialY={imgVerticalOffset} initialWidth={imgWidth} containerWidth={754} align={imgAlign}
                      className="col-start-1 row-start-1 relative z-0"
                      style={imageStyle}
                    >
                      <img src={mainImage} alt="Evidence" draggable="false" className="w-full h-auto object-contain pointer-events-auto bg-white p-1 border-2 border-[#0057FF]/30 shadow-lg outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50" />
                    </InteractiveWrapper>
                  )}
                  <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="box"
                      initialX={horizontalOffset} initialY={actualVerticalOffset} initialWidth={boxWidth} containerWidth={754} align={boxAlign}
                      className={`col-start-1 row-start-1 p-3 relative z-30 ${boxClasses}`}
                      style={{ ...boxStyle, justifySelf: 'flex-start', alignSelf: 'flex-start' }}
                  >
                    <div className={`absolute -top-14 left-0 w-12 h-12 flex items-center justify-center font-bold text-2xl ${numberClasses}`}>
                      {num}
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${titleClasses}`}>{finding.polishedTitle || finding.title}</h3>
                    <div className="font-sans text-[0.95rem] leading-[1.6]">
                      <div className={`font-sans font-semibold mb-2 prose max-w-none ${titleClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedSummary || "" }} />
                      <div className={`prose max-w-none ${bodyClasses}`} dangerouslySetInnerHTML={{ __html: finding.polishedBody || finding.rawNotes || "" }} />
                    </div>
                  </InteractiveWrapper>
                </div>
              );

            } else {
              // Default to legacy-box-left or standard fallback
              layoutContent = (
                <div className="grid grid-cols-1 relative w-full items-start">
                  {secondaryImageNode}
                  {tertiaryImageNode}
                  {mainImage && (
                    <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="image"
                      initialX={imgHorizontalOffset} initialY={imgVerticalOffset} initialWidth={imgWidth} containerWidth={754} align={imgAlign}
                      className="col-start-1 row-start-1 relative z-0"
                      style={imageStyle}
                    >
                      <img src={mainImage} alt="Evidence" draggable="false" className="w-full h-auto object-contain pointer-events-auto bg-white p-1 border-2 border-[#0057FF]/30 shadow-lg outline outline-2 outline-dashed outline-transparent transition-all hover:outline-indigo-500/50" />
                    </InteractiveWrapper>
                  )}
                  <InteractiveWrapper
                      finding={finding} findingId={finding.id} updateFinding={updateFinding} type="box"
                      initialX={horizontalOffset} initialY={actualVerticalOffset} initialWidth={boxWidth} containerWidth={754} align={boxAlign}
                      className={`col-start-1 row-start-1 p-3 relative z-30 ${boxClasses}`}
                      style={{ ...boxStyle, justifySelf: 'flex-start', alignSelf: 'flex-start' }}
                  >
                    <div className={`absolute top-0 -left-14 w-12 h-12 flex items-center justify-center font-bold text-2xl ${numberClasses}`}>
                      {num}
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${titleClasses}`}>{finding.polishedTitle || finding.title}</h3>
                    <div className="font-sans text-[0.95rem] leading-[1.6]">
                      <div className={`prose max-w-none ${bodyClasses}`} dangerouslySetInnerHTML={{ __html: finding.rawNotes || "" }} />
                    </div>
                  </InteractiveWrapper>
                </div>
              );
            }

            const businessImpactNode = finding.showBusinessImpact && finding.businessImpact ? (
              <div className="absolute inset-0 pointer-events-none z-30">
                <InteractiveWrapper
                  finding={finding} findingId={finding.id} updateFinding={updateFinding} type="businessImpact"
                  initialX={finding.businessImpactHorizontalOffset ?? 0} initialY={finding.businessImpactVerticalOffset ?? 100} initialWidth={finding.businessImpactWidth ?? 40} containerWidth={754} align="left"
                  className="bg-white text-black p-4 shadow-xl pointer-events-auto border-l-4 border-l-amber-400"
                  style={{
                    position: 'absolute',
                    width: `${finding.businessImpactWidth ?? 40}%`,
                    transform: `translateY(${finding.businessImpactVerticalOffset ?? 100}px)`,
                    left: `${finding.businessImpactHorizontalOffset ?? 0}px`,
                  }}
                >
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Business Impact
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800 leading-snug" dangerouslySetInnerHTML={{ __html: finding.businessImpact }} />
                </InteractiveWrapper>
              </div>
            ) : null;

            const recommendationNode = finding.showRecommendation && finding.recommendation ? (
              <div className="absolute inset-0 pointer-events-none z-30">
                <InteractiveWrapper
                  finding={finding} findingId={finding.id} updateFinding={updateFinding} type="recommendation"
                  initialX={finding.recommendationHorizontalOffset ?? 0} initialY={finding.recommendationVerticalOffset ?? 200} initialWidth={finding.recommendationWidth ?? 40} containerWidth={754} align="left"
                  className="bg-white text-black p-4 shadow-xl pointer-events-auto border-l-4 border-l-emerald-400"
                  style={{
                    position: 'absolute',
                    width: `${finding.recommendationWidth ?? 40}%`,
                    transform: `translateY(${finding.recommendationVerticalOffset ?? 200}px)`,
                    left: `${finding.recommendationHorizontalOffset ?? 0}px`,
                  }}
                >
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    Recommendation
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800 leading-snug" dangerouslySetInnerHTML={{ __html: finding.recommendation }} />
                </InteractiveWrapper>
              </div>
            ) : null;

            const tableNode = finding.showTable && finding.tableContent ? (
              <div className="absolute inset-0 pointer-events-none z-30">
                <InteractiveWrapper
                  finding={finding} findingId={finding.id} updateFinding={updateFinding} type="table"
                  initialX={finding.tableHorizontalOffset ?? 0} initialY={finding.tableVerticalOffset ?? 300} initialWidth={finding.tableWidth ?? 100} containerWidth={754} align="left"
                  className="pointer-events-auto"
                  style={{
                    position: 'absolute',
                    width: `${finding.tableWidth ?? 100}%`,
                    transform: `translateY(${finding.tableVerticalOffset ?? 300}px)`,
                    left: `${finding.tableHorizontalOffset ?? 0}px`,
                  }}
                >
                  <div className="prose max-w-none prose-report w-full custom-scrollbar overflow-x-auto" dangerouslySetInnerHTML={{ __html: finding.tableContent }} />
                </InteractiveWrapper>
              </div>
            ) : null;

            const pageBreakNode = finding.pageBreakBefore ? <div className="break-before-page" /> : null;

            return (
              <div 
                key={finding.id} 
                id={`finding:${finding.id}`} 
                className={`relative break-inside-avoid ${finding.pageBreakBefore ? 'break-before-column' : ''}`}
              >
                {layoutContent}
                {secondaryImageNode}
                {businessImpactNode}
                {recommendationNode}
                {tableNode}
                
                <AnnotationCanvas targetId={finding.id} targetType="finding" drawMode={drawMode || 'cursor'} />
              </div>
            );
          })})()}
        </div>

      </div>
    </PaginatedSection>
  );
};

