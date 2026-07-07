"use client";

import React, { useEffect, useState, useRef } from "react";
import { LivePreview } from "@/components/audit/LivePreview";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { IframeLightbox } from "@/components/ui/IframeLightbox";
import { ChevronLeft, ChevronRight, Play, SkipBack, SkipForward } from "lucide-react";

export function SharedPresentationViewer({ audit }: { audit: any }) {
  const [scale, setScale] = useState(1);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [centerOffset, setCenterOffset] = useState(0);
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isHoveringBottom, setIsHoveringBottom] = useState(false);

  // Measure scaling and total pages
  useEffect(() => {
    const updateMetrics = () => {
      // 100px vertical padding (50 top, 50 bottom) to avoid overlapping scrubber
      const exactScale = (window.innerHeight - 100) / 1100;
      setScale(exactScale);
      setCenterOffset((window.innerWidth - 850 * exactScale) / 2);

      if (scrollRef.current) {
        // Unscaled width of LivePreview
        const totalWidth = scrollRef.current.scrollWidth;
        const pages = Math.round(totalWidth / 870);
        setTotalPages(Math.max(1, pages));
      }
    };
    
    const intervalId = setInterval(updateMetrics, 500);
    window.addEventListener('resize', updateMetrics);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', updateMetrics);
    };
  }, [hasStarted]);

  // Global interceptor for image clicks and TOC links
  useEffect(() => {
    if (!hasStarted) return;
    const handleInteraction = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle Image Clicks
      let imgTarget: HTMLImageElement | null = null;
      if (target.tagName === 'IMG') {
        imgTarget = target as HTMLImageElement;
      } else if (target.tagName === 'DIV') {
        // Handle case where a wrapper (like DraggableElement) captured the pointer event
        const imgs = target.getElementsByTagName('img');
        if (imgs.length > 0 && imgs[0].parentElement === target) {
          imgTarget = imgs[0];
        }
      }

      if (imgTarget) {
        const src = imgTarget.src;
        if (!src.includes('metamend_logo') && imgTarget.clientWidth > 50) {
          e.preventDefault();
          e.stopPropagation();
          setLightboxSrc(src);
          return;
        }
      }

      // Handle External Links
      const externalLink = target.closest('a[href^="http"]');
      if (externalLink && !externalLink.hasAttribute('data-page')) {
        e.preventDefault();
        e.stopPropagation();
        setIframeSrc(externalLink.getAttribute('href'));
        return;
      }

      // Handle TOC Link Clicks
      const anchor = target.closest('a[data-page]');
      if (anchor) {
        e.preventDefault();
        e.stopPropagation();
        const pageStr = anchor.getAttribute('data-page');
        if (pageStr) {
          const pageIndex = parseInt(pageStr, 10) - 1;
          if (pageIndex >= 0 && pageIndex < totalPages) {
            setCurrentPage(pageIndex);
          }
        }
      }
    };

    document.addEventListener('click', handleInteraction, true);
    return () => document.removeEventListener('click', handleInteraction, true);
  }, [hasStarted, totalPages]);

  const handleNext = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  const handlePrev = () => setCurrentPage(prev => Math.max(0, prev - 1));
  
  // Handle Keyboard Arrows, Mouse Wheel, & Fullscreen Exit
  useEffect(() => {
    if (!hasStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxSrc) return; // Don't flip pages if lightbox is open
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Home') {
        setCurrentPage(0);
      } else if (e.key === 'End') {
        setCurrentPage(totalPages - 1);
      }
    };

    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (lightboxSrc) return;
      
      const now = Date.now();
      if (now - lastWheelTime < 400) return; // 400ms cooldown
      
      if (e.deltaY > 20 || e.deltaX > 20) {
        handleNext();
        lastWheelTime = now;
      } else if (e.deltaY < -20 || e.deltaX < -20) {
        handlePrev();
        lastWheelTime = now;
      }
    };

    const handleFullscreenChange = () => {
      // Allow user to exit fullscreen and stay on the page. Just log or do nothing.
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasStarted, lightboxSrc, totalPages]);

  const handleStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn("Fullscreen request denied or not supported.", err);
    }
    setHasStarted(true);
  };

  if (!audit) return null;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
        <div className="bg-[#0A0A0A] p-12 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center max-w-lg text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <Play className="w-10 h-10 text-blue-500 ml-1" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Audit Presentation</h1>
          <p className="text-white/60 mb-8">
            You have been invited to view the full-screen audit for <span className="text-white font-medium">{audit.companyName}</span>.
          </p>
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleStart}
              className="flex-1 py-3 px-6 rounded-full font-bold bg-[#0057FF] hover:bg-[#0048D9] text-white shadow-lg transition-colors"
            >
              Enter Presentation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const slideTranslation = centerOffset - (currentPage * 870 * scale);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] overflow-hidden">
      {/* Top Bar Hover Zone */}
      <div 
        className="absolute top-0 left-0 right-0 h-32 z-50"
        onMouseEnter={() => setIsHoveringTop(true)}
        onMouseLeave={() => setIsHoveringTop(false)}
      >
        <div className={`p-6 flex justify-start items-center pointer-events-none transition-all duration-500 ${isHoveringTop ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl pointer-events-auto">
            <span className="font-semibold text-white/90">{audit.companyName}</span>
            <span className="text-white/30 mx-3">|</span>
            <span className="text-white/70 text-sm">Slide {currentPage + 1} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Strict CSS to disable all editing elements & enforce read-only */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide dashed borders on hover */
        #presentation-preview-wrapper .group:hover .absolute.inset-0.border-dashed {
          opacity: 0 !important;
          display: none !important;
        }
        /* Hide resize handles */
        #presentation-preview-wrapper .cursor-sw-resize,
        #presentation-preview-wrapper .cursor-se-resize {
          display: none !important;
        }
        /* Hide flip layout buttons */
        #presentation-preview-wrapper button[class*="absolute -top-3 -right-3"] {
          display: none !important;
        }
        
        /* Force cursor to default on wrappers to override inline grab cursor */
        #presentation-preview-wrapper .group {
          cursor: default !important;
        }
        
        /* OVERRIDE Tailwind pointer-events-none on images so Lightbox can receive clicks */
        #presentation-preview-wrapper img {
          pointer-events: auto !important;
          cursor: zoom-in !important;
        }
        
        /* Disable text selection */
        #presentation-preview-wrapper * {
          user-select: none !important;
        }
        
        /* Disable hover z-index popping in presentation mode */
        #presentation-preview-wrapper .group:hover {
          z-index: auto !important;
        }
      `}} />

      {/* Presentation Canvas */}
      <div className="w-full h-full relative group">

        <div 
          className="absolute top-0 left-0 bottom-0 pointer-events-none z-40 backdrop-blur-md bg-black/40 transition-all duration-300"
          style={{ width: centerOffset, maskImage: 'linear-gradient(to right, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
        />
        
        <div 
          className="absolute top-0 right-0 bottom-0 pointer-events-none z-40 backdrop-blur-md bg-black/40 transition-all duration-300"
          style={{ width: centerOffset, maskImage: 'linear-gradient(to left, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 85%, transparent 100%)' }}
        />

        {/* Pagination Controls */}
        {currentPage > 0 && (
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 text-white rounded-full flex items-center justify-center z-50 transition-all opacity-30 hover:opacity-100 shadow-2xl border border-white/20 pointer-events-auto hover:scale-110"
            style={{ left: Math.max(16, centerOffset - 80) }}
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        {currentPage < totalPages - 1 && (
          <button 
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 text-white rounded-full flex items-center justify-center z-50 transition-all opacity-30 hover:opacity-100 shadow-2xl border border-white/20 pointer-events-auto hover:scale-110"
            style={{ left: Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : 2000, centerOffset + (850 * scale) + 16) }}
          >
            <ChevronRight size={32} />
          </button>
        )}

        <div 
          className="absolute top-[50px] left-0"
          style={{ transition: 'transform 0.8s cubic-bezier(0.8, 0, 0.2, 1)', transform: `translateX(${slideTranslation}px)` }}
        >
          <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
            <div id="presentation-preview-wrapper" ref={scrollRef} className="flex">
              <LivePreview audit={audit} activeSection="" activeFindingId={null} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scrubber Hover Zone */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 z-50 flex items-end justify-center pb-4"
        onMouseEnter={() => setIsHoveringBottom(true)}
        onMouseLeave={() => setIsHoveringBottom(false)}
      >
        <div className={`flex items-center gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl transition-all duration-500 origin-bottom ${isHoveringBottom ? 'min-w-[500px] opacity-100 scale-100 translate-y-0' : 'min-w-[300px] opacity-40 scale-75 translate-y-2'}`}>
          <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className={`p-3 rounded-full text-white transition-all overflow-hidden ${isHoveringBottom ? (currentPage === 0 ? 'opacity-30 w-11 cursor-not-allowed' : 'opacity-100 w-11 hover:bg-white/10') : 'opacity-0 w-0 p-0'}`} title="Jump to Start"><SkipBack className="w-5 h-5 shrink-0" /></button>
          <button onClick={handlePrev} disabled={currentPage === 0} className={`p-3 rounded-full text-white transition-all overflow-hidden ${isHoveringBottom ? (currentPage === 0 ? 'opacity-30 w-12 cursor-not-allowed' : 'opacity-100 w-12 hover:bg-white/10') : 'opacity-0 w-0 p-0'}`} title="Previous Slide"><ChevronLeft className="w-6 h-6 shrink-0" /></button>
          
          <div className="flex-1 flex flex-col justify-center px-4 group py-2">
            <input type="range" min={0} max={totalPages - 1} value={currentPage} onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))} className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0057FF] transition-all hover:h-2" />
            <div className={`flex justify-between mt-1 text-[10px] text-white/40 font-medium px-1 uppercase tracking-widest transition-opacity duration-300 ${isHoveringBottom ? 'opacity-100' : 'opacity-0'}`}>
              <span>Start</span><span>Page {currentPage + 1} of {totalPages}</span><span>End</span>
            </div>
          </div>

          <button onClick={handleNext} disabled={currentPage >= totalPages - 1} className={`p-3 rounded-full text-white transition-all overflow-hidden ${isHoveringBottom ? (currentPage >= totalPages - 1 ? 'opacity-30 w-12 cursor-not-allowed' : 'opacity-100 w-12 hover:bg-white/10') : 'opacity-0 w-0 p-0'}`} title="Next Slide"><ChevronRight className="w-6 h-6 shrink-0" /></button>
          <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1} className={`p-3 rounded-full text-white transition-all overflow-hidden ${isHoveringBottom ? (currentPage >= totalPages - 1 ? 'opacity-30 w-11 cursor-not-allowed' : 'opacity-100 w-11 hover:bg-white/10') : 'opacity-0 w-0 p-0'}`} title="Jump to End"><SkipForward className="w-5 h-5 shrink-0" /></button>
        </div>
      </div>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      {iframeSrc && <IframeLightbox src={iframeSrc} onClose={() => setIframeSrc(null)} />}
    </div>
  );
}
