"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { AbstractWaves } from "@/components/ui/AbstractWaves";
import { StandardServices } from "@/components/audit/StandardServices";
import { Conclusion } from "@/components/audit/Conclusion";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const mockAudit = {
    companyName: "Acme Spas",
    clientLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png",
    reportStructure: {
      executiveSummary: "Acme Spas commands a strong legacy brand presence in the luxury hydrotherapy market, yet critical friction points across the digital journey are artificially depressing lead velocity. While organic visibility is healthy for branded terms, non-branded acquisition is heavily cannibalized by an outdated, flat URL architecture that confuses search engines and forces users into dead ends. By restructuring the technical foundation and elevating trust signals, Acme Spas can recapture an estimated 25% of the currently leaked top-of-funnel traffic and drive a measurable increase in showroom foot traffic.",
      sections: [
        {
          title: "Brand and Trust Risks",
          subtitle: "What happens when users search Acme Spas?",
          intro: "Across the entire decision-making journey, touchpoints that should build confidence are instead introducing friction and uncertainty before the user even clicks your link.",
          findings: [
            {
              id: "f1",
              layoutType: "image-left",
              polishedTitle: "Disjointed Brand Identity in SERPs",
              polishedSummary: "<p>Legacy meta data and missing organization schema are forcing Google to dynamically generate search snippets that do not reflect Acme's premium positioning.</p>",
              polishedBody: "<p>When potential buyers search for 'Acme Spas reviews', the search engine results pages (SERPs) are dominated by third-party aggregators rather than Acme's own controlled assets. The lack of structured data allows Google to pull random, outdated pricing forum threads into the primary snippet.</p>",
              imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
            }
          ]
        },
        {
          title: "Discovery",
          subtitle: "The Visibility Crisis",
          intro: "Technical roadblocks are preventing your highest-margin products from competing for non-branded, high-volume search queries.",
          findings: [
            {
              id: "f2",
              layoutType: "gallery",
              polishedTitle: "Keyword Cannibalization on Core Categories",
              polishedSummary: "<p>'Hot Tubs' and 'Swim Spas' category pages are actively competing against individual product models for the same search terms, splitting ranking power.</p>",
              polishedBody: "<p>Due to a flat URL structure where <code>/hot-tubs/</code> and <code>/model-x/</code> sit at the exact same architectural level, search engines cannot determine which page is the authoritative pillar. As a result, both pages fluctuate wildly between pages 2 and 3 of Google.</p>",
              imageUrls: [
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1000&auto=format&fit=crop"
              ]
            }
          ]
        },
        {
          title: "Conversion",
          subtitle: "Friction at the Finish Line",
          intro: "High-intent users are abandoning the journey at the exact moment they should be submitting a lead.",
          findings: [
            {
              id: "f3",
              layoutType: "image-full",
              polishedTitle: "Dealer Locator Drop-Off on Mobile",
              polishedSummary: "<p>The interactive map required to find a local dealer fails to load properly on iOS Safari, blocking the primary conversion action for 60% of site traffic.</p>",
              polishedBody: "<p>The current dealer locator relies on an outdated, heavy JavaScript payload that routinely times out on mobile networks. Users are presented with a blank grey box instead of a map.</p>",
              imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop"
            }
          ]
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Floating Actions (Hidden in Print) */}
      <div className="fixed top-8 right-8 z-50 print:hidden flex gap-4">
        <Button variant="outline" className="bg-black/50 border-white/20 text-white backdrop-blur-md">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Editor
        </Button>
        <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
          <Printer className="mr-2 w-4 h-4" /> Export PDF
        </Button>
      </div>

      {lightboxImg && <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}

      <div id="print-area" className="w-full max-w-[850px] mx-auto bg-[#050505] text-white print:bg-white print:text-black shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Cover Page */}
        <section className="h-screen min-h-[800px] flex flex-col justify-center px-16 relative page-break-after overflow-hidden">
          
          <AbstractWaves />

          <div className="relative z-10 flex flex-col items-end text-right mt-24">
            <div className="bg-[#0057FF] px-8 py-4 rounded-md mb-8 flex items-center justify-center shadow-lg" style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)' }}>
               <img 
                 src={mockAudit.clientLogoUrl} 
                 alt="Client Logo" 
                 className="h-10 w-auto object-contain print:invert" 
               />
            </div>
            
            <h1 className="text-[5.5rem] leading-[0.95] font-black tracking-tight text-[#3B82F6] print:text-black">
              High Level<br/>Audit
            </h1>
            
            <div className="flex flex-col items-end mt-8 gap-4">
               <div className="w-48 h-1.5 bg-gradient-to-r from-[#3B82F6] to-[#A855F7] rounded-full"></div>
               {/* Arrow Icon matching reference */}
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#A855F7]">
                 <path d="M7 17L17 17V7M17 17L7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end z-10">
            <p className="text-[#3B82F6] text-sm font-semibold tracking-wide">metamend.com</p>
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-sm font-medium">Produced by</span>
              <img src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" alt="Metamend" className="h-10 w-auto print:invert opacity-90" />
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="min-h-screen grid grid-cols-12 page-break-after bg-[#f4f5f7] print:bg-white overflow-hidden relative">
          {/* Left Dark Sidebar */}
          <div className="col-span-4 bg-[#111] relative overflow-hidden h-full z-10 print:border-r print:border-black/10">
            <div className="absolute top-1/2 left-[-20%] -translate-y-1/2 w-[800px] h-[800px] opacity-40 text-blue-600">
               <AbstractWaves variant="dark" />
            </div>
          </div>

          {/* Right Content */}
          <div className="col-span-8 px-20 py-24 flex flex-col justify-center h-full relative z-20">
             <h2 className="text-[5rem] font-black tracking-tighter text-black leading-[1.1] mb-16 font-sans">
               Table of<br/>Contents
             </h2>

             <div className="relative pl-6">
               {/* Vertical Line */}
               <div className="absolute left-10 top-1 bottom-1 w-1 bg-black rounded-full"></div>
               
               <div className="flex flex-col gap-4 pl-12 font-sans">
                  
                  <div className="flex items-center gap-6">
                     <span className="text-[1.35rem] font-bold w-8 text-black text-right">01</span>
                     <span className="text-[1.35rem] font-bold text-black">Executive Summary</span>
                  </div>

                  {(mockAudit.reportStructure.sections || []).map((section: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-4">
                      <div className="flex items-center gap-6">
                         <span className="text-[1.35rem] font-bold w-8 text-black text-right">{String(idx + 2).padStart(2, '0')}</span>
                         <span className="text-[1.35rem] font-bold text-black">{section.title}</span>
                      </div>
                      {/* Sub-items (the findings) */}
                      {section.findings?.map((finding: any, fIdx: number) => (
                         <div key={fIdx} className="flex items-center gap-6">
                           <span className="text-[1.15rem] font-normal w-8 text-black text-right"></span>
                           <span className="text-[1.15rem] text-gray-700">{finding.title || "Finding"}</span>
                         </div>
                      ))}
                    </div>
                  ))}

                  <div className="flex items-center gap-6 mt-2">
                     <span className="text-[1.35rem] font-bold w-8 text-black text-right">{String((mockAudit.reportStructure.sections?.length || 0) + 2).padStart(2, '0')}</span>
                     <span className="text-[1.35rem] font-bold text-black">Standard SEO Services</span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <span className="text-[1.35rem] font-bold w-8 text-black text-right">{String((mockAudit.reportStructure.sections?.length || 0) + 3).padStart(2, '0')}</span>
                     <span className="text-[1.35rem] font-bold text-black">Conclusion & Next Steps</span>
                  </div>

               </div>
             </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="min-h-screen page-break-after bg-[#f8f9fa] print:bg-white relative overflow-hidden flex flex-col font-sans">
          
          {/* Top Header Bar */}
          <div className="w-full bg-[#111] px-12 py-5 flex items-center justify-between z-20 shadow-sm border-b border-white/10 print:border-black/5">
            <img src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" alt="Metamend" className="h-7 w-auto print:invert" />
          </div>

          <div className="flex-1 flex w-full h-full relative z-10 pt-6 pb-24 pl-8 pr-0">
            
            {/* Rotated Title Left Column */}
            <div className="w-24 shrink-0 relative mt-4">
               <h2 className="text-[3.5rem] font-black tracking-tighter text-black -rotate-90 origin-top-left absolute top-[600px] left-8 whitespace-nowrap">
                 Executive Summary
               </h2>
            </div>

            {/* Gray Content Box */}
            <div className="flex-1 bg-[#e2e2e2] print:bg-[#f3f4f6] py-10 pl-10 pr-16 shadow-xl relative mt-4 border-y border-l border-black/5">
               
               {/* Header Section inside Gray Box */}
               <div className="flex justify-between items-start mb-10">
                 <div>
                   {/* Black Bar directly above the title */}
                   <div className="w-64 h-5 bg-[#111] mb-6"></div>
                   <h3 className="text-[2.75rem] font-bold text-black leading-[1.1] tracking-tight">
                     Creating the Right Conditions<br/>for Growth
                   </h3>
                 </div>
                 {/* Arrow to the right */}
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0057FF] mt-12 shrink-0"><path d="M7 7L17 17M17 17V7M17 17H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>

               {/* Content */}
               <div className="flex flex-col gap-8">
                 <div className="font-sans text-[1.1rem] leading-[1.7] text-black prose prose-gray max-w-none w-full">
                   <div dangerouslySetInnerHTML={{ __html: mockAudit.reportStructure.executiveSummary }} />
                 </div>
               </div>
            </div>
          </div>

          {/* Abstract Waves Bottom Left */}
          <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] opacity-15 pointer-events-none z-0 text-[#0057FF]">
             <AbstractWaves variant="light" />
          </div>

          {/* Page Number */}
          <div className="absolute bottom-8 right-16 text-black font-bold tracking-widest text-sm z-20 font-sans">
            1 | P a g e
          </div>
        </section>

        {/* Dynamic Sections */}
        <div className="px-12 py-20">
          {(mockAudit.reportStructure.sections || []).map((section, sIdx) => (
            <section key={sIdx} className="mb-32 page-break-before">
              
              <div className="mb-16 pb-8 border-b border-white/10 print:border-black/20 page-break-inside-avoid">
                <span className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-4 block">Stage {sIdx + 1} • {section.title}</span>
                <h2 className="text-5xl font-bold mb-6 text-white print:text-black tracking-tight">{section.subtitle}</h2>
                <p className="text-xl text-white/60 print:text-gray-600 font-serif max-w-3xl leading-relaxed italic border-l-4 border-indigo-500/50 pl-6">
                  "{section.intro}"
                </p>
              </div>

              <div className="flex flex-col gap-12">
                {section.findings.map((finding: any, fIdx: number) => {
                  const mainImage = finding.imageUrls?.[0] || finding.imageUrl;
                  
                  return (
                    <div key={finding.id} className="relative page-break-inside-avoid mb-16">
                      
                      {finding.layoutType === 'gallery' && finding.imageUrls && finding.imageUrls.length > 1 ? (
                        <div className="flex flex-col mt-8 mb-24 relative">
                          <div className="w-[90%] rounded-lg shadow-xl border border-white/10 print:border-black/20 overflow-hidden bg-white/5 print:bg-gray-50 p-2">
                             <div className="grid grid-cols-2 gap-2">
                               {finding.imageUrls.map((img: string, i: number) => (
                                 <button 
                                    key={i} 
                                    type="button" 
                                    onClick={() => setLightboxImg(img)} 
                                    className="w-full h-48 overflow-hidden rounded cursor-zoom-in relative group"
                                 >
                                   <img src={img} alt={`Evidence ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                 </button>
                               ))}
                             </div>
                          </div>
                          <div className="w-[85%] self-end bg-[#222] print:bg-[#1a1a1a] p-10 shadow-2xl text-white -mt-16 relative z-10 border border-white/5 print:border-black/50">
                            <div className="absolute -top-12 right-12 w-24 h-24 bg-[#111] print:bg-[#222] flex items-center justify-center shadow-xl border border-white/10 print:border-black/50">
                              <span className="text-4xl font-bold text-white">{String(fIdx + 1).padStart(2, '0')}</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-6 pr-32 leading-tight">{finding.polishedTitle}</h3>
                            <div className="font-serif text-lg leading-relaxed text-white/90">
                              <div className="font-sans font-semibold mb-2 prose prose-invert max-w-none text-white print:text-white" dangerouslySetInnerHTML={{ __html: finding.polishedSummary }} />
                              <div className="prose prose-invert max-w-none text-white/90 print:text-white" dangerouslySetInnerHTML={{ __html: finding.polishedBody }} />
                            </div>
                          </div>
                        </div>
                      ) : finding.layoutType === 'image-left' ? (
                        <div className="flex flex-col mt-8 mb-24 relative">
                          {mainImage ? (
                            <div className="w-[90%] rounded-lg shadow-xl border border-white/10 print:border-black/20 overflow-hidden bg-white/5 print:bg-gray-50 p-2">
                              <button type="button" onClick={() => setLightboxImg(mainImage)} className="w-full cursor-zoom-in block">
                                <img src={mainImage} alt="Evidence" className="w-full h-auto object-contain max-h-[500px] mx-auto" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-[90%] h-64 bg-white/5 rounded-lg border border-white/10"></div>
                          )}
                          <div className="w-[85%] self-end bg-[#222] print:bg-[#1a1a1a] p-10 shadow-2xl text-white -mt-16 relative z-10 border border-white/5 print:border-black/50">
                            <div className="absolute -top-12 right-12 w-24 h-24 bg-[#111] print:bg-[#222] flex items-center justify-center shadow-xl border border-white/10 print:border-black/50">
                              <span className="text-4xl font-bold text-white">{String(fIdx + 1).padStart(2, '0')}</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-6 pr-32 leading-tight">{finding.polishedTitle}</h3>
                            <div className="font-serif text-lg leading-relaxed text-white/90">
                              <div className="font-sans font-semibold mb-2 prose prose-invert max-w-none text-white print:text-white" dangerouslySetInnerHTML={{ __html: finding.polishedSummary }} />
                              <div className="prose prose-invert max-w-none text-white/90 print:text-white" dangerouslySetInnerHTML={{ __html: finding.polishedBody }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 p-8 border-l-4 border-indigo-500 bg-white/5 print:bg-gray-50">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl">
                              {String(fIdx + 1).padStart(2, '0')}
                            </div>
                            <h3 className="text-2xl font-bold text-white print:text-black">{finding.polishedTitle}</h3>
                          </div>
                          {mainImage && (
                            <div className="w-full rounded-lg overflow-hidden border border-white/10 print:border-black/20 my-4 bg-white/5 print:bg-white p-2">
                              <button type="button" onClick={() => setLightboxImg(mainImage)} className="w-full cursor-zoom-in block">
                                <img src={mainImage} alt="Evidence" className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                              </button>
                            </div>
                          )}
                          <div className="font-serif text-lg leading-relaxed text-white/80 print:text-gray-800 space-y-4">
                            <div className="font-sans font-semibold text-white print:text-black prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: finding.polishedSummary }} />
                            <div className="prose prose-invert max-w-none text-white/80 print:text-gray-800" dangerouslySetInnerHTML={{ __html: finding.polishedBody }} />
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <StandardServices primaryService="SEO" />
        <Conclusion />

      </div>
    </div>
  );
}
