import React, { useEffect, useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";

interface IframeLightboxProps {
  src: string;
  onClose: () => void;
}

export function IframeLightbox({ src, onClose }: IframeLightboxProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Prevent scrolling on body when lightbox is open
  useEffect(() => {
    // Fallback: hide the loading spinner after 5 seconds no matter what, in case onLoad gets blocked
    const fallbackTimer = setTimeout(() => setIsLoading(false), 5000);

    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(fallbackTimer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-zinc-400 text-sm font-medium truncate max-w-md ml-2">{src}</span>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={src} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              title="Open in a new tab if the website refuses to load here"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-md bg-transparent hover:bg-red-500/80 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 bg-zinc-100">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Loading external resource...</p>
              <p className="text-sm mt-2 max-w-md text-center opacity-70">
                (If the page remains blank, the website may be blocking embedded views. Use the "Open in New Tab" button above.)
              </p>
            </div>
          )}
          <iframe 
            src={src.toLowerCase().includes('.pdf') ? `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true` : `/audits/api/proxy?url=${encodeURIComponent(src)}`}
            className={`w-full h-full border-none transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
