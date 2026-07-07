import React, { useState } from "react";
import { Block, BlockType, useStore } from "@/lib/store";
import { compressImage } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { v4 as uuidv4 } from "uuid";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  auditId?: string;
  pageId?: string;
}

export function BlockEditor({ blocks, onChange, auditId, pageId }: BlockEditorProps) {
  const audit = useStore(state => auditId ? state.audits[auditId] : null);
  const updateAudit = useStore(state => state.updateAudit);

  // Initialize blocks as collapsed (false) to keep UI clean, but you could initialize with Set of ids for expanded if desired
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [expandedSubItems, setExpandedSubItems] = useState<Set<string>>(new Set());

  const toggleSubItem = (id: string) => {
    const next = new Set(expandedSubItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSubItems(next);
  };

  const toggleBlock = (id: string) => {
    const next = new Set(expandedBlocks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedBlocks(next);
  };

  const updateBlock = (id: string, newData: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data: newData } : b));
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: uuidv4(),
      type: type,
      data: type === 'HeroHeader' ? { title: 'New Header', alignment: 'left' } :
            type === 'StageHeader' ? { heading: 'New Stage Header', subheading: 'Optional Subheading' } :
            type === 'StageCaption' ? { caption: 'Add your standalone caption text here.' } :
            type === 'RichText' ? { html: '<p>Start typing...</p>' } :
            type === 'HighlightCards' ? { cards: [{ title: 'Card 1', text: 'Text' }] } :
            type === 'ProcessSteps' ? { steps: [{ title: 'Step 1', description: '<p>Description...</p>' }] } :
            type === 'ServiceList' ? { columns: 2, services: [{ title: 'Service 1', description: '<p>Description...</p>' }] } :
            type === 'ThankYou' ? { name: "Matthew Bowes", phone: "+1 250 483 6713", email: "mbowes@metamend.com", website: "metamend.com" } : {}
    };
    onChange([...blocks, newBlock]);
    // Expand the newly added block automatically
    setExpandedBlocks(prev => new Set([...prev, newBlock.id]));
  };

  const removeBlock = (id: string) => {
    if (window.confirm("Are you sure you want to delete this block? This cannot be undone.")) {
      onChange(blocks.filter(b => b.id !== id));
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      onChange(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
      onChange(newBlocks);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => (
        <div key={block.id} className="bg-[#111] border border-white/10 rounded-md relative flex flex-col">
          <div 
            onClick={() => toggleBlock(block.id)}
            className={`p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors rounded-t-md ${!expandedBlocks.has(block.id) ? 'rounded-b-md' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-white/50">
                {expandedBlocks.has(block.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              <div className="text-xs font-bold text-[#0057FF] uppercase tracking-wider">{block.type} BLOCK</div>
            </div>
            
            <div className="flex gap-2 items-center">
              <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} disabled={index === 0} className="text-white/50 hover:text-white p-1 disabled:opacity-30 hover:bg-white/10 rounded transition-colors">↑</button>
              <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} disabled={index === blocks.length - 1} className="text-white/50 hover:text-white p-1 disabled:opacity-30 hover:bg-white/10 rounded transition-colors">↓</button>
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="text-red-400 hover:text-red-300 p-1 ml-4 hover:bg-red-400/10 rounded transition-colors">✕</button>
            </div>
          </div>

          {expandedBlocks.has(block.id) && (
            <div className="px-6 pb-6 pt-0">
              {block.type === 'Cover' && audit && auditId && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Company Name</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        value={audit.companyName || ""} 
                        onChange={e => updateAudit(auditId, { companyName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                      />
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70 w-fit hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={audit.hideCompanyName || false}
                          onChange={(e) => updateAudit(auditId, { hideCompanyName: e.target.checked })}
                          className="w-4 h-4 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-1"
                        />
                        Hide company name on cover
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Audit Title</label>
                    <input 
                      type="text" 
                      value={audit.auditTitle || ""} 
                      onChange={e => updateAudit(auditId, { auditTitle: e.target.value })}
                      placeholder="e.g. Digital Strategy Audit"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Audit Date</label>
                    <input 
                      type="date" 
                      value={audit.date ? new Date(audit.date).toISOString().split('T')[0] : ''} 
                      onChange={e => {
                        const dateVal = e.target.value ? new Date(e.target.value).toISOString() : '';
                        updateAudit(auditId, { date: dateVal });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Website URL</label>
                    <input 
                      type="text" 
                      value={audit.websiteUrl || ""} 
                      onChange={e => updateAudit(auditId, { websiteUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Prepared By</label>
                    <input 
                      type="text" 
                      value={audit.preparedBy || ""} 
                      onChange={e => updateAudit(auditId, { preparedBy: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Base Service</label>
                    <select 
                      value={audit.primaryService || "SEO"} 
                      onChange={e => updateAudit(auditId, { primaryService: e.target.value as any })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white"
                    >
                      <option value="SEO">SEO</option>
                      <option value="SEM">SEM</option>
                      <option value="CRO">CRO</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Full Search Marketing">Full Search Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Audit Status</label>
                    <select 
                      value={audit.status || "Draft"} 
                      onChange={e => updateAudit(auditId, { status: e.target.value as any })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Review">Review</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">Cover Logos</label>
                    <div className="flex flex-col gap-4">
                      {audit.coverLogos && audit.coverLogos.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          {audit.coverLogos.map((logo) => (
                            <div key={logo.id} className="relative w-24 h-24 bg-black/40 border border-white/10 rounded-lg overflow-hidden group">
                              <img src={logo.url} alt="Cover Logo" className="w-full h-full object-contain p-2" />
                              
                              <div className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white p-1 rounded-md cursor-pointer h-6 w-6">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M12 3v18"/></svg>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = async () => {
                                        const compressed = await compressImage(reader.result as string);
                                        const newLogos = audit.coverLogos!.map(l => l.id === logo.id ? { ...l, url: compressed } : l);
                                        updateAudit(auditId, { coverLogos: newLogos });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                    e.target.value = '';
                                  }} />
                                </label>
                              </div>

                              <button 
                                onClick={() => updateAudit(auditId, { coverLogos: audit.coverLogos!.filter(l => l.id !== logo.id) })}
                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-6 w-6"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="relative w-full h-16 bg-white/5 border border-white/10 border-dashed rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="text-white/50 flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          <span className="text-sm font-medium">Add Logo</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const compressed = await compressImage(reader.result as string);
                                const newLogo = {
                                  id: crypto.randomUUID(),
                                  url: compressed,
                                  x: 400,
                                  y: 100,
                                  width: 30
                                };
                                updateAudit(auditId, { coverLogos: [...(audit.coverLogos || []), newLogo] });
                              };
                              reader.readAsDataURL(file);
                            }
                            // Reset the input so the same file can be uploaded again if needed
                            e.target.value = '';
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'HeroHeader' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Title</label>
                <input 
                  type="text" 
                  value={block.data.title || ""} 
                  onChange={e => updateBlock(block.id, { ...block.data, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Subtitle (Optional)</label>
                <input 
                  type="text" 
                  value={block.data.subtitle || ""} 
                  onChange={e => updateBlock(block.id, { ...block.data, subtitle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Alignment</label>
                <select 
                  value={block.data.alignment || "left"} 
                  onChange={e => updateBlock(block.id, { ...block.data, alignment: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white"
                >
                  <option value="left">Flush Left</option>
                  <option value="right">Flush Right</option>
                  <option value="center">Centered</option>
                </select>
              </div>
            </div>
          )}

          {block.type === 'StageHeader' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Stage (Optional Subheading)</label>
                <input 
                  type="text" 
                  value={block.data.subheading || ""} 
                  onChange={e => updateBlock(block.id, { ...block.data, subheading: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Main Heading</label>
                <input 
                  type="text" 
                  value={block.data.heading || ""} 
                  onChange={e => updateBlock(block.id, { ...block.data, heading: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Caption (Optional)</label>
                <textarea 
                  value={block.data.caption || ""} 
                  onChange={e => updateBlock(block.id, { ...block.data, caption: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white min-h-[100px]"
                />
              </div>
            </div>
          )}

          {block.type === 'StageCaption' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Stage Caption text</label>
                <textarea 
                  value={block.data.caption || ""} 
                  onChange={e => updateBlock(block.id, { ...block.data, caption: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white min-h-[100px]"
                />
              </div>
            </div>
          )}

          {block.type === 'RichText' && (
            <div className="rounded-lg overflow-hidden border border-white/10">
              <RichTextEditor 
                value={block.data.html || ""} 
                onChange={val => updateBlock(block.id, { ...block.data, html: val })} 
                minHeight="200px" 
              />
            </div>
          )}

          {block.type === 'HighlightCards' && (
            <div className="flex flex-col gap-4">
              {(block.data.cards || []).map((card: any, cardIndex: number) => (
                <div key={cardIndex} className="bg-white/5 p-4 rounded-lg flex flex-col gap-3">
                  <div 
                    onClick={() => toggleSubItem(`${block.id}-card-${cardIndex}`)}
                    className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/50">
                        {expandedSubItems.has(`${block.id}-card-${cardIndex}`) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                      <span className="text-sm font-bold text-white/60">{card.title || `Card ${cardIndex + 1}`}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this card?")) {
                          const newCards = [...block.data.cards];
                          newCards.splice(cardIndex, 1);
                          updateBlock(block.id, { ...block.data, cards: newCards });
                        }
                      }}
                      className="text-red-400 text-xs hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                    >
                      Remove Card
                    </button>
                  </div>
                  {expandedSubItems.has(`${block.id}-card-${cardIndex}`) && (
                    <>
                      <input 
                    type="text" 
                    placeholder="Large Number (Optional e.g. '01')" 
                    value={card.number || ""} 
                    onChange={e => {
                      const newCards = [...block.data.cards];
                      newCards[cardIndex].number = e.target.value;
                      updateBlock(block.id, { ...block.data, cards: newCards });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Card Title" 
                    value={card.title || ""} 
                    onChange={e => {
                      const newCards = [...block.data.cards];
                      newCards[cardIndex].title = e.target.value;
                      updateBlock(block.id, { ...block.data, cards: newCards });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                  />
                  <textarea 
                    placeholder="Card Text" 
                    value={card.text || ""} 
                    onChange={e => {
                      const newCards = [...block.data.cards];
                      newCards[cardIndex].text = e.target.value;
                      updateBlock(block.id, { ...block.data, cards: newCards });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white min-h-[80px]"
                  />
                    </>
                  )}
                </div>
              ))}
              <button 
                onClick={() => {
                  const newIndex = (block.data.cards || []).length;
                  toggleSubItem(`${block.id}-card-${newIndex}`);
                  updateBlock(block.id, { ...block.data, cards: [...(block.data.cards || []), { title: 'New Card', text: '' }] });
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                + Add Card
              </button>
            </div>
          )}
        {block.type === 'ProcessSteps' && (
            <div className="flex flex-col gap-4">
              <div className="bg-black/20 border border-white/5 rounded-lg p-4 mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">Process Steps Layout</span>
                <select 
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={block.data.variant || 'list'}
                  onChange={e => updateBlock(block.id, { ...block.data, variant: e.target.value })}
                >
                  <option value="list">Editorial List</option>
                  <option value="grid">Grid Matrix</option>
                </select>
              </div>
              {(block.data.steps || []).map((step: any, stepIndex: number) => (
                <div key={stepIndex} className="bg-white/5 p-4 rounded-lg flex flex-col gap-3">
                  <div 
                    onClick={() => toggleSubItem(`${block.id}-step-${stepIndex}`)}
                    className="flex justify-between items-center mb-2 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/50">
                        {expandedSubItems.has(`${block.id}-step-${stepIndex}`) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                      <span className="text-sm font-bold text-white/60">{step.title || `Step ${stepIndex + 1}`}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this step?")) {
                          const newSteps = [...block.data.steps];
                          newSteps.splice(stepIndex, 1);
                          updateBlock(block.id, { ...block.data, steps: newSteps });
                        }
                      }}
                      className="text-red-400 text-xs hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                    >
                      Remove Step
                    </button>
                  </div>
                  {expandedSubItems.has(`${block.id}-step-${stepIndex}`) && (
                    <>
                      <input 
                    type="text" 
                    placeholder="Step Title" 
                    value={step.title || ""} 
                    onChange={e => {
                      const newSteps = [...block.data.steps];
                      newSteps[stepIndex].title = e.target.value;
                      updateBlock(block.id, { ...block.data, steps: newSteps });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                  />
                  <div className="rounded-lg overflow-hidden border border-white/10 mt-2">
                    <RichTextEditor 
                      value={step.description || ""} 
                      onChange={val => {
                        const newSteps = [...block.data.steps];
                        newSteps[stepIndex].description = val;
                        updateBlock(block.id, { ...block.data, steps: newSteps });
                      }} 
                      minHeight="120px" 
                    />
                  </div>
                    </>
                  )}
                </div>
              ))}
              <button 
                onClick={() => {
                  const newIndex = (block.data.steps || []).length;
                  toggleSubItem(`${block.id}-step-${newIndex}`);
                  updateBlock(block.id, { ...block.data, steps: [...(block.data.steps || []), { title: 'New Step', description: '<p></p>' }] });
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-semibold mt-2"
              >
                + Add Step
              </button>
            </div>
          )}

          {block.type === 'ServiceList' && (
            <div className="flex flex-col gap-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/80 mb-2">Columns</label>
                <select 
                  value={block.data.columns || 2} 
                  onChange={e => updateBlock(block.id, { ...block.data, columns: parseInt(e.target.value) })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                </select>
              </div>

              {(block.data.services || []).map((service: any, serviceIndex: number) => (
                <div key={serviceIndex} className="bg-white/5 p-4 rounded-lg flex flex-col gap-3">
                  <div 
                    onClick={() => toggleSubItem(`${block.id}-service-${serviceIndex}`)}
                    className="flex justify-between items-center mb-2 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/50">
                        {expandedSubItems.has(`${block.id}-service-${serviceIndex}`) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                      <span className="text-sm font-bold text-white/60">{service.title || `Service ${serviceIndex + 1}`}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this service?")) {
                          const newServices = [...block.data.services];
                          newServices.splice(serviceIndex, 1);
                          updateBlock(block.id, { ...block.data, services: newServices });
                        }
                      }}
                      className="text-red-400 text-xs hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                    >
                      Remove Service
                    </button>
                  </div>
                  {expandedSubItems.has(`${block.id}-service-${serviceIndex}`) && (
                    <>
                      <input 
                    type="text" 
                    placeholder="Service Title" 
                    value={service.title || ""} 
                    onChange={e => {
                      const newServices = [...block.data.services];
                      newServices[serviceIndex].title = e.target.value;
                      updateBlock(block.id, { ...block.data, services: newServices });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
                  />
                  <div className="rounded-lg overflow-hidden border border-white/10 mt-2">
                    <RichTextEditor 
                      value={service.description || ""} 
                      onChange={val => {
                        const newServices = [...block.data.services];
                        newServices[serviceIndex].description = val;
                        updateBlock(block.id, { ...block.data, services: newServices });
                      }} 
                      minHeight="120px" 
                    />
                  </div>
                    </>
                  )}
                </div>
              ))}
              <button 
                onClick={() => {
                  const newIndex = (block.data.services || []).length;
                  toggleSubItem(`${block.id}-service-${newIndex}`);
                  updateBlock(block.id, { ...block.data, services: [...(block.data.services || []), { title: 'New Service', description: '<p></p>' }] });
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-semibold mt-2"
              >
                + Add Service
              </button>
            </div>
          )}

          {block.type === 'ThankYou' && (
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Name" 
                value={block.data.name || ""} 
                onChange={e => updateBlock(block.id, { ...block.data, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
              />
              <input 
                type="text" 
                placeholder="Phone" 
                value={block.data.phone || ""} 
                onChange={e => updateBlock(block.id, { ...block.data, phone: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={block.data.email || ""} 
                onChange={e => updateBlock(block.id, { ...block.data, email: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
              />
              <input 
                type="text" 
                placeholder="Website" 
                value={block.data.website || ""} 
                onChange={e => updateBlock(block.id, { ...block.data, website: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
          )}
          
            </div>
          )}
        </div>
      ))}

      {pageId !== 'cover' && pageId !== 'thank-you' && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10 mt-4">
          <button onClick={() => addBlock('HeroHeader')} className="px-4 py-2 bg-[#0057FF]/20 text-[#0057FF] hover:bg-[#0057FF]/30 rounded-lg text-sm font-bold transition-colors">+ Hero Header</button>
          <button onClick={() => addBlock('StageHeader')} className="px-4 py-2 bg-[#0057FF]/20 text-[#0057FF] hover:bg-[#0057FF]/30 rounded-lg text-sm font-bold transition-colors">+ Stage Header</button>
          <button onClick={() => addBlock('StageCaption')} className="px-4 py-2 bg-[#0057FF]/20 text-[#0057FF] hover:bg-[#0057FF]/30 rounded-lg text-sm font-bold transition-colors">+ Stage Caption</button>
          <button onClick={() => addBlock('RichText')} className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">+ Text Content</button>
          <button onClick={() => addBlock('HighlightCards')} className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">+ Highlight Cards</button>
          <button onClick={() => addBlock('ProcessSteps')} className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">+ Process Steps</button>
          <button onClick={() => addBlock('ServiceList')} className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">+ Service Grid</button>
        </div>
      )}
    </div>
  );
}
