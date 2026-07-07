import React, { useState, useEffect, useId } from 'react';
import { useStore, Finding, Audit } from "@/lib/store";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, ChevronRight, Trash2, Copy, Bookmark } from 'lucide-react';

const SortableFindingItem = ({ finding, isActive, onSelect, onDelete, onDuplicate, onRename }: { finding: Finding, isActive: boolean, onSelect: () => void, onDelete: () => void, onDuplicate: () => void, onRename: (newTitle: string) => void }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(finding.title);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: 'finding-' + finding.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as any,
  };

  if (finding.isPageBreak) {
    return (
      <div ref={setNodeRef} style={style} className="w-full flex items-center justify-center py-2 group relative">
        <div 
          {...attributes} 
          {...listeners} 
          className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 py-1 rounded transition-colors"
        >
          <div className="h-px bg-white/20 w-8 mr-3"></div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Page Break</span>
          <div className="h-px bg-white/20 w-8 ml-3"></div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute right-2 p-1 text-white/20 hover:text-red-400 hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all z-20"
          title="Delete Page Break"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={{ ...style, opacity: 0.5 }} className="w-full flex gap-1 group relative">
        <div className="w-6"></div>
        <div className="flex-1 h-16 border-2 border-dashed border-[#0057FF]/50 bg-[#0057FF]/10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full flex gap-1 group relative pl-1">
      <div 
        {...attributes} 
        {...listeners} 
        className={`w-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      >
        <GripVertical size={14} />
      </div>
      <div className={`flex-1 relative flex items-center rounded-md transition-all group/item ${isActive ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}>
        {isEditing ? (
          <div className="flex-1 p-2 pr-6">
            <input
              autoFocus
              className="w-full bg-black/40 border border-[#0057FF]/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (editTitle.trim()) onRename(editTitle.trim());
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(finding.title);
                }
              }}
              onBlur={() => {
                setIsEditing(false);
                if (editTitle.trim()) onRename(editTitle.trim());
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              if (isActive) setIsEditing(true);
              else onSelect();
            }}
            className="flex-1 text-left p-3"
            title={isActive ? "Click to rename" : ""}
          >
            <div className="font-medium text-white text-sm break-words whitespace-normal leading-tight pr-6">{finding.title || "Untitled Finding"}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground truncate max-w-[80px]">{finding.category}</span>
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${finding.severity === 'Critical' ? 'bg-destructive/20 text-destructive' : 'bg-white/10 text-muted-foreground'}`}>{finding.severity}</span>
            </div>
          </button>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/item:opacity-100 transition-all z-20">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-red-500/90 rounded-md p-1 z-30">
              <span className="text-[9px] font-bold text-white px-1">Sure?</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-[9px] font-bold text-white hover:bg-white/20 px-1.5 py-0.5 rounded"
              >
                Yes
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                className="text-[9px] font-bold text-white/70 hover:text-white hover:bg-white/20 px-1.5 py-0.5 rounded"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-md"
                title="Duplicate Finding"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="p-1.5 text-white/20 hover:text-red-400 hover:bg-white/10 rounded-md"
                title="Delete Finding"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SortablePageItem = ({ page, isActive, onSelect, onDelete, onDuplicate, onSaveTemplate, onRename }: { page: any, isActive: boolean, onSelect: () => void, onDelete: () => void, onDuplicate: () => void, onSaveTemplate: () => void, onRename?: (newTitle: string) => void }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(page.title);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: 'page-' + page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as any,
  };

  const isCover = page.id === 'cover';
  const isThankYou = page.id === 'thank-you';
  const isExecutiveSummary = page.id === 'executive-summary';
  const isConclusion = page.id === 'conclusion';
  const isFindings = page.id === 'findings';
  
  if (isCover || isThankYou) {
    return (
      <div className="w-full flex flex-col gap-0">
        {isEditing ? (
          <div className="flex-1 p-2">
            <input
              autoFocus
              className="w-full bg-black/40 border border-[#0057FF]/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (onRename && editTitle.trim()) onRename(editTitle.trim());
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(page.title);
                }
              }}
              onBlur={() => {
                setIsEditing(false);
                if (onRename && editTitle.trim()) onRename(editTitle.trim());
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              if (isActive && onRename) setIsEditing(true);
              else onSelect();
            }}
            className={`w-full text-left p-3 rounded-md transition-all ${isActive ? 'bg-[#0057FF]/20 border border-[#0057FF]/50' : 'hover:bg-white/5 border border-transparent'}`}
            title={isActive ? "Click to rename" : ""}
          >
            <div className="font-medium text-white text-sm break-words whitespace-normal leading-tight">{page.title}</div>
          </button>
        )}
      </div>
    );
  }

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={{ ...style, opacity: 0.5 }} className="w-full flex gap-1 group relative">
        <div className="w-6"></div>
        <div className="flex-1 h-12 border-2 border-dashed border-[#0057FF]/50 bg-[#0057FF]/10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full flex gap-1 group relative">
      <div 
        {...attributes} 
        {...listeners} 
        className={`w-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      >
        <GripVertical size={14} />
      </div>
      <div className={`flex-1 relative flex items-center rounded-md transition-all group/item ${isActive ? 'bg-[#0057FF]/20 border border-[#0057FF]/50' : 'hover:bg-white/5 border border-transparent'}`}>
        {isEditing ? (
          <div className="flex-1 p-2 pr-6">
            <input
              autoFocus
              className="w-full bg-black/40 border border-[#0057FF]/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  if (onRename && editTitle.trim()) onRename(editTitle.trim());
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(page.title);
                }
              }}
              onBlur={() => {
                setIsEditing(false);
                if (onRename && editTitle.trim()) onRename(editTitle.trim());
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              if (isActive && onRename) {
                setIsEditing(true);
              } else {
                onSelect();
              }
            }}
            className="flex-1 text-left p-3"
            title={isActive ? "Click to rename" : ""}
          >
            <div className="font-medium text-white text-sm break-words whitespace-normal leading-tight pr-6">{page.title}</div>
          </button>
        )}
        {!isExecutiveSummary && !isConclusion && !isFindings && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/item:opacity-100 transition-all">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-red-500/90 rounded-md p-1 z-30">
                <span className="text-[9px] font-bold text-white px-1">Sure?</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-[9px] font-bold text-white hover:bg-white/20 px-1.5 py-0.5 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                  className="text-[9px] font-bold text-white/70 hover:text-white hover:bg-white/20 px-1.5 py-0.5 rounded"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                  className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-md"
                  title="Duplicate Page"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSaveTemplate(); }}
                  className="p-1.5 text-white/20 hover:text-amber-400 hover:bg-white/10 rounded-md"
                  title="Save as Template"
                >
                  <Bookmark size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  className="p-1.5 text-white/20 hover:text-red-400 hover:bg-white/10 rounded-md"
                  title="Delete Page"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SortableStageItem = ({ 
  stage, 
  stageFindings, 
  customStages, 
  audit, 
  isCollapsed, 
  setCollapsedStages, 
  editingStage, 
  setEditingStage, 
  editStageName, 
  setEditStageName, 
  handleRenameStage, 
  activeFindingId, 
  onSelectFinding, 
  onSelectPage,
  items
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: 'stage-' + stage });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as any,
  };
  
  const removeFinding = useStore(state => state.removeFinding);
  const updateFinding = useStore(state => state.updateFinding);

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={{ ...style, opacity: 0.5 }} className="border-l-2 border-[#0057FF]/50 ml-0 mb-2 bg-[#0057FF]/10 h-10 rounded-md border-dashed border-2"></div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="border-l-2 border-indigo-500/30 ml-0 mb-2 bg-[#0C0F1A]">
      <div className="flex items-center justify-between mb-2 ml-1 group">
         <div className="flex items-center gap-1 group/stage w-full">
           <button 
             {...attributes} 
             {...listeners}
             className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 p-0.5 rounded transition-colors"
             title="Drag to reorder section"
           >
             <GripVertical size={12} />
           </button>
           <button 
             onClick={() => setCollapsedStages((prev: any) => ({ ...prev, [stage]: prev[stage] === false ? true : false }))}
             className="flex items-center gap-1 hover:bg-white/5 pr-1 py-0.5 rounded transition-colors"
           >
             <span className="text-white/40">
               {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
             </span>
           </button>
           {editingStage === stage ? (
             <input
               autoFocus
               className="bg-black/40 border border-[#0057FF]/50 rounded px-1.5 py-0.5 text-[11px] font-bold text-indigo-300 uppercase focus:outline-none w-32"
               value={editStageName}
               onChange={(e) => setEditStageName(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   setEditingStage(null);
                   handleRenameStage(stage, editStageName);
                 } else if (e.key === 'Escape') {
                   setEditingStage(null);
                 }
               }}
               onBlur={() => {
                 setEditingStage(null);
                 handleRenameStage(stage, editStageName);
               }}
             />
           ) : (
             <button 
               onClick={() => {
                 if (isCollapsed) {
                   setCollapsedStages((prev: any) => ({ ...prev, [stage]: false }));
                 } else {
                   setEditingStage(stage);
                   setEditStageName(stage);
                 }
               }}
               className="text-[11px] font-bold text-indigo-300/80 uppercase tracking-wider hover:text-indigo-300 text-left px-1 py-0.5 rounded hover:bg-white/5 transition-colors flex-1"
               title={isCollapsed ? "Click to expand" : "Click to rename section"}
             >
               {stage}
             </button>
           )}
         </div>
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button
               onClick={() => {
                 if (confirm(`Delete section "${stage}"? Any findings inside will be moved to "Unassigned".`)) {
                   // Move findings to Unassigned
                   stageFindings.forEach((f: any) => {
                     useStore.getState().updateFinding(f.id, { stage: "Unassigned" });
                   });
                   const newCustomStages = customStages.filter((s: string) => s !== stage);
                   useStore.getState().updateReportStructure(audit.id, { customStages: newCustomStages });
                 }
               }}
               className="text-[9px] text-white/40 hover:text-red-400 hover:bg-white/5 p-1 rounded transition-colors"
               title="Delete Section"
             >
               <Trash2 size={12} />
             </button>
           <button
             onClick={() => {
               useStore.getState().addFinding(audit.id, {
                 title: "--- Page Break ---",
                 rawNotes: "",
                 stage,
                 category: "Layout",
                 severity: "Low",
                 layoutType: "legacy-box-left",
                 isPageBreak: true
               });
             }}
             className="text-[9px] bg-white/5 hover:bg-white/20 text-white px-1.5 py-0.5 rounded transition-colors"
           >
             + Break
           </button>
           <button
             onClick={() => {
               useStore.getState().addFinding(audit.id, {
                 title: "New Finding",
                 rawNotes: "",
                 stage,
                 category: "SEO",
                 severity: "Medium",
                 layoutType: "legacy-box-left"
               });
             }}
             className="text-[9px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded transition-colors"
           >
             + Finding
           </button>
         </div>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col gap-1 ml-0 pl-1 border-l border-white/5">
          {stageFindings.map((finding: any) => (
            <SortableFindingItem 
              key={finding.id} 
              finding={finding} 
              isActive={activeFindingId === finding.id}
              onSelect={() => onSelectFinding && onSelectFinding(finding.id)}
              onDelete={() => {
                removeFinding(finding.id);
                if (activeFindingId === finding.id) {
                  onSelectPage('cover');
                }
              }}
              onRename={(newTitle) => updateFinding(finding.id, { title: newTitle })}
              onDuplicate={() => {
                const currentStageFindings = items.filter((f: any) => f.stage === finding.stage);
                const nextNumber = currentStageFindings.length + 1;
                const nextNumberStr = nextNumber.toString().padStart(2, '0');
                
                let newTitle = finding.title;
                // Strip any leading numbers and separators (e.g. "01 - ", "2.", "3 ")
                const match = newTitle.match(/^[\d\.\-\s]+(.*)/);
                if (match && match[1]) {
                  newTitle = `${nextNumberStr} - ${match[1]}`;
                } else {
                  newTitle = `${nextNumberStr} - ${newTitle}`;
                }
                
                const newFindingId = useStore.getState().addFinding(audit.id, {
                  title: newTitle,
                  rawNotes: finding.rawNotes,
                  stage: finding.stage,
                  category: finding.category,
                  severity: finding.severity,
                  layoutType: finding.layoutType,
                  boxColor: finding.boxColor,
                  imageUrl: finding.imageUrl,
                  imageUrls: finding.imageUrls ? [...finding.imageUrls] : undefined,
                  imageCaption: finding.imageCaption,
                  boxWidth: finding.boxWidth,
                  verticalOffset: finding.verticalOffset,
                  horizontalOffset: finding.horizontalOffset,
                  imageWidth: finding.imageWidth,
                  imageVerticalOffset: finding.imageVerticalOffset,
                  imageHorizontalOffset: finding.imageHorizontalOffset,
                  image2Width: finding.image2Width,
                  image2VerticalOffset: finding.image2VerticalOffset,
                  image2HorizontalOffset: finding.image2HorizontalOffset,
                  showBusinessImpact: finding.showBusinessImpact,
                  showRecommendation: finding.showRecommendation,
                  showTable: finding.showTable,
                  businessImpact: finding.businessImpact,
                  recommendation: finding.recommendation,
                  tableContent: finding.tableContent,
                  tableHorizontalOffset: finding.tableHorizontalOffset,
                  tableVerticalOffset: finding.tableVerticalOffset,
                  tableWidth: finding.tableWidth,
                  isPageBreak: finding.isPageBreak,
                  pageBreakBefore: finding.pageBreakBefore
                });
                
                // Select the newly duplicated finding
                if (onSelectFinding) onSelectFinding(newFindingId);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SortablePagesList = ({ audit, activeSection, onSelectPage, activeFindingId, onSelectFinding }: { audit: Audit, activeSection: string, onSelectPage: (id: string) => void, activeFindingId?: string | null, onSelectFinding?: (id: string) => void }) => {
  const updatePages = useStore(state => state.updatePages);
  const allFindings = useStore(state => state.findings);
  const updateFinding = useStore(state => state.updateFinding);
  const removeFinding = useStore(state => state.removeFinding);
  const savePageTemplate = useStore(state => state.savePageTemplate);
  const pageTemplates = useStore(state => state.pageTemplates);
  const addPageToAudit = useStore(state => state.addPageToAudit);
  
  const pages = audit.pages || [];
  const visiblePages = pages.filter(p => !p.isHidden);
  
  const dndId = useId();
  
  // We only want to sort the inner pages. Cover must be first, Thank You must be last.
  const draggablePages = visiblePages.filter(p => p.id !== 'cover' && p.id !== 'thank-you');

  const orderedStages = React.useMemo(() => {
    const customStages = audit.reportStructure?.customStages || [];
    const findingStages = Array.from(new Set(Object.values(allFindings).filter(f => f.auditId === audit.id).map(f => f.stage)));
    return Array.from(new Set([...customStages, ...findingStages]));
  }, [audit.reportStructure?.customStages, allFindings, audit.id]);

  const items = React.useMemo(() => {
    const findingsForAudit = Object.values(allFindings).filter(f => f.auditId === audit.id);
    const sortedFindings: Finding[] = [];
    
    // Sort findings to perfectly match the DOM order required by dnd-kit
    orderedStages.forEach(stage => {
      const stageFindings = findingsForAudit
        .filter(f => f.stage === stage)
        .sort((a, b) => a.order - b.order);
      sortedFindings.push(...stageFindings);
    });
    
    // Safety net
    const unaccountedFindings = findingsForAudit.filter(f => !orderedStages.includes(f.stage)).sort((a, b) => a.order - b.order);
    sortedFindings.push(...unaccountedFindings);
    
    return sortedFindings;
  }, [allFindings, audit.id, orderedStages]);
  const [isFindingsExpanded, setIsFindingsExpanded] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editStageName, setEditStageName] = useState("");

  const handleRenameStage = (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) return;
    
    const cleanName = newName.trim();
    
    // Update all findings in this stage
    const findingsInStage = items.filter(f => f.stage === oldName);
    findingsInStage.forEach(f => {
      updateFinding(f.id, { stage: cleanName });
    });
    
    // Update customStages and stageConfigs
    const customStages = audit.reportStructure?.customStages || [];
    const newCustomStages = customStages.map(s => s === oldName ? cleanName : s);
    if (!customStages.includes(oldName)) {
      newCustomStages.push(cleanName); // ensure the new name is tracked
    }
    
    const stageConfigs = audit.reportStructure?.stageConfigs || {};
    const newStageConfigs = { ...stageConfigs };
    if (newStageConfigs[oldName]) {
      newStageConfigs[cleanName] = newStageConfigs[oldName];
      delete newStageConfigs[oldName];
    }
    
    useStore.getState().updateReportStructure(audit.id, { 
      customStages: newCustomStages,
      stageConfigs: newStageConfigs
    });
  };

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<'page' | 'stage' | 'finding' | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const idStr = String(event.active.id);
    setActiveDragId(idStr);
    if (idStr.startsWith('page-')) setActiveDragType('page');
    else if (idStr.startsWith('stage-')) setActiveDragType('stage');
    else if (idStr.startsWith('finding-')) setActiveDragType('finding');
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDragType(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const activeStr = String(active.id);
    const overStr = String(over.id);

    if (activeStr.startsWith('page-') && overStr.startsWith('page-')) {
       const activeId = activeStr.replace('page-', '');
       const overId = overStr.replace('page-', '');
       const oldIndex = pages.findIndex(p => p.id === activeId);
       const newIndex = pages.findIndex(p => p.id === overId);
       if (oldIndex !== -1 && newIndex !== -1) {
           const newPages = arrayMove(pages, oldIndex, newIndex);
           updatePages(audit.id, newPages);
       }
    } else if (activeStr.startsWith('finding-') && overStr.startsWith('finding-')) {
       const activeId = activeStr.replace('finding-', '');
       const overId = overStr.replace('finding-', '');
       
       const oldIndex = items.findIndex(i => i.id === activeId);
       const newIndex = items.findIndex(i => i.id === overId);
       
       if (oldIndex !== -1 && newIndex !== -1) {
           const newItems = arrayMove(items, oldIndex, newIndex);
           
           // Determine the new stage for the specifically moved item
           let newStage = items[oldIndex].stage;
           if (newIndex > 0) {
             newStage = newItems[newIndex - 1].stage;
           } else if (newItems.length > 1) {
             newStage = newItems[1].stage;
           }
           
           newItems.forEach((item, index) => {
             const updates: Partial<Finding> = { order: index };
             // Only inherit stage for the actively moved item
             if (item.id === activeId) {
               updates.stage = newStage;
             }
             updateFinding(item.id, updates);
           });
       }
    } else if (activeStr.startsWith('stage-') && overStr.startsWith('stage-')) {
       const activeStage = activeStr.replace('stage-', '');
       const overStage = overStr.replace('stage-', '');
       
       const customStages = audit.reportStructure?.customStages || [];
       const findingStages = items.map(f => f.stage);
       const orderedStages = Array.from(new Set([...customStages, ...findingStages]));
       
       const oldIndex = orderedStages.indexOf(activeStage);
       const newIndex = orderedStages.indexOf(overStage);
       
       if (oldIndex !== -1 && newIndex !== -1) {
           const newStages = arrayMove(orderedStages, oldIndex, newIndex);
           useStore.getState().updateReportStructure(audit.id, { customStages: newStages });
       }
    }
  };

  let activeDragItemTitle = "Item";
  if (activeDragId) {
    if (activeDragType === 'page') {
      const p = pages.find(p => 'page-' + p.id === activeDragId);
      if (p) activeDragItemTitle = p.title;
    } else if (activeDragType === 'stage') {
      activeDragItemTitle = activeDragId.replace('stage-', '');
    } else if (activeDragType === 'finding') {
      const f = items.find(i => 'finding-' + i.id === activeDragId);
      if (f) activeDragItemTitle = f.title || "Untitled Finding";
    }
  }

  return (
    <DndContext 
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={draggablePages.map(p => 'page-' + p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-1">
          {visiblePages.map((page) => {
             const isCover = page.id === 'cover';
             return (
                <React.Fragment key={page.id}>
                  <SortablePageItem 
                    page={page} 
                    isActive={activeSection === `page:${page.id}`}
                    onSelect={() => onSelectPage(page.id)}
                    onDelete={() => {
                      const newPages = pages.filter(p => p.id !== page.id);
                      updatePages(audit.id, newPages);
                      if (activeSection === `page:${page.id}`) {
                         onSelectPage('cover');
                      }
                    }}
                    onDuplicate={() => {
                      const pageIndex = pages.findIndex(p => p.id === page.id);
                      const newId = crypto.randomUUID();
                      // Deep clone the blocks to assign fresh IDs so react keys don't conflict
                      const duplicatedBlocks = page.blocks ? page.blocks.map((b: any) => {
                        const newData = JSON.parse(JSON.stringify(b.data));
                        if (b.type === 'HeroHeader' && newData.title) {
                          newData.title = `${newData.title} (Copy)`;
                        }
                        return {
                          ...b,
                          id: crypto.randomUUID(),
                          data: newData
                        };
                      }) : [];
                      
                      const duplicatedPage = {
                        ...page,
                        id: newId,
                        title: `${page.title} (Copy)`,
                        isLocked: false,
                        blocks: duplicatedBlocks
                      };
                      
                      const newPages = [...pages];
                      newPages.splice(pageIndex + 1, 0, duplicatedPage);
                      updatePages(audit.id, newPages);
                      // Select the newly duplicated page
                      onSelectPage(newId);
                    }}
                    onSaveTemplate={() => {
                      const name = prompt("Enter a name for this Page Template:", page.title);
                      if (name) {
                        savePageTemplate(page, name);
                        alert(`Template "${name}" saved!`);
                      }
                    }}
                    onRename={(newTitle) => {
                      const newPages = pages.map(p => p.id === page.id ? { ...p, title: newTitle } : p);
                      updatePages(audit.id, newPages);
                    }}
                  />
                  {isCover && (
                    <button
                      onClick={() => onSelectPage("toc_pseudo_id")}
                      className={`w-full text-left p-3 rounded-md transition-all ${activeSection === "toc" ? 'bg-[#0057FF]/20 border border-[#0057FF]/50' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <div className="font-medium text-white text-sm truncate">Table of Contents</div>
                    </button>
                  )}
                  {page.id === 'findings' && onSelectFinding && (
                    <div className="pl-2 border-l-2 border-white/5 ml-2 mt-2 mb-2 pb-2">
                       {/* Findings Block inside Findings page */}
                       <div className="mt-2 flex flex-col gap-4">
                         <div className="flex items-center justify-between px-2">
                            <button 
                              onClick={() => setIsFindingsExpanded(!isFindingsExpanded)}
                              className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider hover:text-white/80 transition-colors"
                            >
                              {isFindingsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              Findings
                            </button>
                         </div>
                         
                         {isFindingsExpanded && (() => {
                           const customStages = audit.reportStructure?.customStages || [];
                           
                           return (
                             <div className="flex flex-col gap-4">
                               <div className="px-2 flex flex-wrap gap-2">
                                 <button 
                                   onClick={() => setIsAddingSection(true)}
                                   className="flex-1 text-[10px] bg-white/5 hover:bg-white/20 text-white px-2 py-1.5 rounded transition-colors flex items-center justify-center gap-1 border border-white/10"
                                 >
                                   + Add Section
                                 </button>
                               </div>

                               {isAddingSection && (
                                 <div className="px-2 flex flex-col gap-2 mb-2">
                                   <div className="flex gap-2">
                                     <input 
                                       autoFocus
                                       list="section-presets"
                                       type="text" 
                                       value={newSectionName}
                                       onChange={e => setNewSectionName(e.target.value)}
                                       placeholder="Type or select section..."
                                       className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                     onKeyDown={e => {
                                       if (e.key === 'Enter' && newSectionName.trim()) {
                                         const currentCustom = audit.reportStructure?.customStages || [];
                                         const cleanName = newSectionName.trim();
                                         if (!currentCustom.includes(cleanName)) {
                                           useStore.getState().updateReportStructure(audit.id, {
                                              customStages: [...currentCustom, cleanName]
                                           });
                                         }
                                         setNewSectionName("");
                                         setIsAddingSection(false);
                                       } else if (e.key === 'Escape') {
                                         setIsAddingSection(false);
                                         setNewSectionName("");
                                       }
                                     }}
                                   />
                                     <button 
                                       onClick={() => { setIsAddingSection(false); setNewSectionName(""); }}
                                       className="text-white/40 hover:text-white/80 p-1"
                                     >
                                       <Trash2 size={12} />
                                     </button>
                                   </div>
                                   <datalist id="section-presets">
                                     <option value="Discovery" />
                                     <option value="Consideration" />
                                     <option value="Conversion" />
                                     <option value="Retention" />
                                     <option value="Advocacy" />
                                     <option value="Discovery & Architecture" />
                                     <option value="Engagement Friction" />
                                     <option value="Conversion Leaks" />
                                     <option value="Technical Equity" />
                                   </datalist>
                                 </div>
                               )}
                               
                               <SortableContext items={orderedStages.map(s => 'stage-' + s)} strategy={verticalListSortingStrategy}>
                                 <SortableContext items={items.map(i => 'finding-' + i.id)} strategy={verticalListSortingStrategy}>
                                   {orderedStages.map(stage => {
                                     const stageFindings = items.filter(f => f.stage === stage);
                                     // Only show stage if it has findings OR is a custom stage
                                     if (stageFindings.length === 0 && !customStages.includes(stage)) return null;
                                     
                                     // By default, sections are collapsed (true) unless explicitly set to false
                                     const isCollapsed = collapsedStages[stage] !== false;
                                     
                                     return (
                                       <SortableStageItem 
                                          key={stage}
                                          stage={stage}
                                          stageFindings={stageFindings}
                                          customStages={customStages}
                                          audit={audit}
                                          isCollapsed={isCollapsed}
                                          setCollapsedStages={setCollapsedStages}
                                          editingStage={editingStage}
                                          setEditingStage={setEditingStage}
                                          editStageName={editStageName}
                                          setEditStageName={setEditStageName}
                                          handleRenameStage={handleRenameStage}
                                          activeFindingId={activeFindingId}
                                          onSelectFinding={onSelectFinding}
                                          onSelectPage={onSelectPage}
                                          items={items}
                                       />
                                     );
                                   })}
                                 </SortableContext>
                               </SortableContext>
                             </div>
                           );
                         })()}
                       </div>
                    </div>
                  )}
                </React.Fragment>
             );
          })}
        </div>
        
        <div className="flex flex-col gap-2 mt-4 px-2 relative">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const newId = addPageToAudit(audit.id);
                if (newId) onSelectPage(newId);
              }}
              className="flex-1 text-[10px] bg-white/5 hover:bg-white/20 text-white px-2 py-1.5 rounded transition-colors flex items-center justify-center gap-1 border border-white/10"
            >
              + Blank Page
            </button>
            <button 
              onClick={() => setIsAddingTemplate(!isAddingTemplate)}
              className="flex-1 text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-2 py-1.5 rounded transition-colors flex items-center justify-center gap-1 border border-indigo-500/20"
            >
              + From Template
            </button>
          </div>
          
          {isAddingTemplate && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1C23] border border-white/10 rounded-md shadow-xl overflow-hidden z-50">
              <div className="p-2 border-b border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                Select Template
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {Object.values(pageTemplates).length === 0 ? (
                  <div className="p-3 text-xs text-white/40 text-center">No templates saved.</div>
                ) : (
                  Object.values(pageTemplates).map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        const newId = addPageToAudit(audit.id, tpl.id);
                        if (newId) onSelectPage(newId);
                        setIsAddingTemplate(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-indigo-500/20 transition-colors"
                    >
                      {tpl.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeDragId ? (
          <div className="bg-[#0057FF]/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-2xl border border-white/20 text-sm font-bold opacity-100 cursor-grabbing flex items-center gap-3 w-[260px]">
            <GripVertical size={16} className="text-white/50" />
            <div className="truncate flex-1">{activeDragItemTitle}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
