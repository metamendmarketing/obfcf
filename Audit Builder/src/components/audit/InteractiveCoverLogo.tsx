import React from 'react';

interface InteractiveCoverLogoProps {
  id: string;
  url: string;
  initialX: number;
  initialY: number;
  initialWidth: number;
  containerWidth: number;
  onUpdate: (id: string, updates: { x?: number; y?: number; width?: number }) => void;
  onDelete: (id: string) => void;
}

export function InteractiveCoverLogo({
  id,
  url,
  initialX,
  initialY,
  initialWidth,
  containerWidth,
  onUpdate,
  onDelete
}: InteractiveCoverLogoProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0, startX: 0, startY: 0, startWidth: 0 });

  const onPointerDown = (e: React.PointerEvent, action: 'drag' | 'resize') => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    e.currentTarget.setPointerCapture(e.pointerId);
    
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
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const dx = (moveEvent.clientX - dragStart.current.x) / scale;
        const dy = (moveEvent.clientY - dragStart.current.y) / scale;
        
        if (action === 'drag') {
          onUpdate(id, { x: dragStart.current.startX + dx, y: dragStart.current.startY + dy });
        } else if (action === 'resize') {
          let newWidth = dragStart.current.startWidth + (dx / containerWidth * 100);
          newWidth = Math.max(10, Math.min(100, newWidth));
          onUpdate(id, { width: newWidth });
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
    };

    target.addEventListener('pointermove', onPointerMove as EventListener);
    target.addEventListener('pointerup', onPointerUp as EventListener);
    target.addEventListener('pointercancel', cleanup as EventListener);
    target.addEventListener('lostpointercapture', cleanup as EventListener);
  };

  return (
    <div 
      className={`absolute group hover:z-50 print:z-0`} 
      style={{ 
        transform: `translate(${initialX}px, ${initialY}px)`,
        width: `${initialWidth}%`,
        cursor: 'grab' 
      }}
      onPointerDown={(e) => onPointerDown(e, 'drag')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={url} alt="Cover Logo" className="w-full h-auto object-contain pointer-events-none" />
      
      <button 
        className="absolute -top-3 -right-3 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden shadow-lg z-50 hover:bg-red-500 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
      </button>

      <div 
        className={`absolute bottom-0 right-0 rounded-tl-lg cursor-se-resize w-6 h-6 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden data-html2canvas-ignore z-50`}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPointerDown(e, 'resize');
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <path d="M21 15v6h-6"/><path d="M21 21l-7-7"/>
        </svg>
      </div>
    </div>
  );
}
