import React, { useState, useRef } from 'react';
import { useStore, Annotation } from '@/lib/store';

interface AnnotationCanvasProps {
  targetId: string;
  targetType?: 'finding' | 'page';
  auditId?: string;
  drawMode: 'cursor' | 'box' | 'arrow';
}

export function AnnotationCanvas({ targetId, targetType = 'finding', auditId, drawMode }: AnnotationCanvasProps) {
  const finding = useStore((state) => targetType === 'finding' ? state.findings[targetId] : null);
  const audit = useStore((state) => targetType === 'page' && auditId ? state.audits[auditId] : null);
  const page = audit?.pages?.find(p => p.id === targetId);

  const updateFinding = useStore((state) => state.updateFinding);
  const updatePageAnnotations = useStore((state) => state.updatePageAnnotations);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDraw, setCurrentDraw] = useState<Partial<Annotation> | null>(null);
  const [draggingAnnId, setDraggingAnnId] = useState<string | null>(null);
  const dragStartCoord = useRef<{x: number, y: number} | null>(null);
  const rafId = useRef<number | null>(null);

  const isPresentation = typeof window !== 'undefined' && (
    window.location.pathname.includes('/present') || 
    window.location.pathname.includes('/view') || 
    window.location.pathname.includes('/preview')
  );

  if (targetType === 'finding' && !finding) return null;
  if (targetType === 'page' && !page) return null;

  const annotations = (targetType === 'finding' ? finding?.annotations : page?.annotations) || [];

  const updateAnnotations = (newAnnotations: Annotation[]) => {
    if (targetType === 'finding') {
      updateFinding(targetId, { annotations: newAnnotations });
    } else if (targetType === 'page' && auditId) {
      updatePageAnnotations(auditId, targetId, newAnnotations);
    }
  };

  const getCoordinates = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPresentation || drawMode === 'cursor' || e.button !== 0) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setCurrentDraw({
      type: drawMode,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: drawMode === 'box' ? '#22c55e' : '#3b82f6' // bright green for box, blue for arrow
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentDraw) return;
    const { x, y } = getCoordinates(e);
    setCurrentDraw({
      ...currentDraw,
      endX: x,
      endY: y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing || !currentDraw) return;
    setIsDrawing(false);
    
    const dx = currentDraw.endX! - currentDraw.startX!;
    const dy = currentDraw.endY! - currentDraw.startY!;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Minimum 0.5% distance to count as a real shape (prevents accidental clicks)
    if (distance > 0.5) {
      const newAnnotation: Annotation = {
        id: crypto.randomUUID(),
        type: currentDraw.type as 'box' | 'arrow',
        startX: currentDraw.startX!,
        startY: currentDraw.startY!,
        endX: currentDraw.endX!,
        endY: currentDraw.endY!,
        color: currentDraw.color!
      };
      
      updateAnnotations([...annotations, newAnnotation]);
    }
    
    setCurrentDraw(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const deleteAnnotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPresentation && drawMode === 'cursor') {
        updateAnnotations(annotations.filter(a => a.id !== id));
    }
  };

  const handleAnnPointerDown = (id: string, e: React.PointerEvent) => {
    if (isPresentation || drawMode !== 'cursor' || e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingAnnId(id);
    dragStartCoord.current = getCoordinates(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleAnnPointerMove = (id: string, e: React.PointerEvent) => {
    if (draggingAnnId !== id || !dragStartCoord.current) return;
    
    // We need to persist the event properties we use since React might pool/recycle the event
    // though React 17+ doesn't pool, it's safer to just extract what we need
    const { x, y } = getCoordinates(e);

    if (rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!dragStartCoord.current) return;

      const dx = x - dragStartCoord.current.x;
      const dy = y - dragStartCoord.current.y;
      dragStartCoord.current = { x, y };

      const ann = annotations.find(a => a.id === id);
      if (ann) {
          const updated = { ...ann, startX: ann.startX + dx, startY: ann.startY + dy, endX: ann.endX + dx, endY: ann.endY + dy };
          updateAnnotations(annotations.map(a => a.id === id ? updated : a));
      }
    });
  };

  const handleAnnPointerUp = (id: string, e: React.PointerEvent) => {
    if (draggingAnnId === id) {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        setDraggingAnnId(null);
        dragStartCoord.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const renderArrow = (ann: Partial<Annotation>, isTemp = false) => {
    const { startX, startY, endX, endY, color, id } = ann;
    if (startX === undefined || startY === undefined || endX === undefined || endY === undefined) return null;

    const isClickable = !isTemp && drawMode === 'cursor';
    const markerId = `arrowhead-${(color || '#3b82f6').replace('#', '')}`;

    return (
      <g 
        key={id || 'temp'} 
        className={isClickable ? 'cursor-grab active:cursor-grabbing hover:opacity-50 transition-opacity group' : ''}
        style={{ pointerEvents: isClickable ? 'all' : 'none' }}
        onDoubleClick={isClickable ? (e) => deleteAnnotation(id!, e) : undefined}
        onPointerDown={isClickable ? (e) => handleAnnPointerDown(id!, e) : undefined}
        onPointerMove={isClickable ? (e) => handleAnnPointerMove(id!, e) : undefined}
        onPointerUp={isClickable ? (e) => handleAnnPointerUp(id!, e) : undefined}
        onPointerCancel={isClickable ? (e) => handleAnnPointerUp(id!, e) : undefined}
      >
        <line 
          x1={`${startX}%`} 
          y1={`${startY}%`} 
          x2={`${endX}%`} 
          y2={`${endY}%`} 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
        />
        {/* Invisible thicker stroke for easier clicking */}
        <line x1={`${startX}%`} y1={`${startY}%`} x2={`${endX}%`} y2={`${endY}%`} stroke="transparent" strokeWidth="15" />
      </g>
    );
  };

  const renderBox = (ann: Partial<Annotation>, isTemp = false) => {
    const { startX, startY, endX, endY, color, id } = ann;
    if (startX === undefined || startY === undefined || endX === undefined || endY === undefined) return null;

    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    
    const isClickable = !isTemp && drawMode === 'cursor';

    return (
      <rect
        key={id || 'temp'}
        x={`${x}%`}
        y={`${y}%`}
        width={`${w}%`}
        height={`${h}%`}
        stroke={color}
        strokeWidth="3"
        fill={isTemp ? `${color}20` : 'transparent'}
        className={isClickable ? 'cursor-grab active:cursor-grabbing hover:fill-red-500/20 transition-colors' : ''}
        style={{ pointerEvents: isClickable ? 'all' : 'none' }}
        onDoubleClick={isClickable ? (e) => deleteAnnotation(id!, e) : undefined}
        onPointerDown={isClickable ? (e) => handleAnnPointerDown(id!, e) : undefined}
        onPointerMove={isClickable ? (e) => handleAnnPointerMove(id!, e) : undefined}
        onPointerUp={isClickable ? (e) => handleAnnPointerUp(id!, e) : undefined}
        onPointerCancel={isClickable ? (e) => handleAnnPointerUp(id!, e) : undefined}
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 z-50 ${drawMode !== 'cursor' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <svg 
        className="w-full h-full pointer-events-none" 
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker id="arrowhead-3b82f6" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
          </marker>
          <marker id="arrowhead-ef4444" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-22c55e" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
          </marker>
        </defs>
        {annotations.map(ann => ann.type === 'arrow' ? renderArrow(ann) : renderBox(ann))}
        {isDrawing && currentDraw && (currentDraw.type === 'arrow' ? renderArrow(currentDraw, true) : renderBox(currentDraw, true))}
      </svg>
    </div>
  );
}
