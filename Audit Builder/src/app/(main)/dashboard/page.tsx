"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, FileText, ArrowRight, Copy, Trash2, Bookmark, Play, Share2, Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const audits = useStore((state) => state.audits);
  const activeEditors = useStore((state) => state.activeEditors || {});
  const deleteAudit = useStore((state) => state.deleteAudit);
  const cloneAudit = useStore((state) => state.cloneAudit);
  const saveAuditAsTemplate = useStore((state) => state.saveAuditAsTemplate);
  const router = useRouter();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingAuditId, setSharingAuditId] = useState<string | null>(null);
  const [sharedCopiedId, setSharedCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  // Wait for IndexedDB to load the audits before showing the empty state
  useEffect(() => {
    setIsHydrated(useStore.persist.hasHydrated());
    const unsub = useStore.persist.onFinishHydration(() => setIsHydrated(true));
    return () => unsub();
  }, []);

  const handleShareAudit = async (e: React.MouseEvent, auditId: string) => {
    e.stopPropagation();
    setSharingAuditId(auditId);
    try {
      const shareId = crypto.randomUUID();
      const auditToShare = audits[auditId];
      const findingsToShare = Object.values(useStore.getState().findings).filter(f => f.auditId === auditId);
      
      const { error } = await supabase.from('app_state').upsert({
        id: `shared-${shareId}`,
        state: { ...auditToShare, findings: findingsToShare }
      });

      if (error) throw error;

      const baseUrl = window.location.href.split('/dashboard')[0];
      const shareUrl = `${baseUrl}/view/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      setSharedCopiedId(auditId);
      setTimeout(() => setSharedCopiedId(null), 3000);
    } catch (err) {
      console.error("Failed to share audit:", err);
      alert("Failed to generate share link. Please try again.");
    } finally {
      setSharingAuditId(null);
    }
  };
  
  const [isSyncing, setIsSyncing] = useState(false);
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const { data } = await supabase.from('app_state').select('state').eq('id', 'audit-builder-storage').single();
      if (data && data.state) {
        let shellState = typeof data.state === 'string' ? JSON.parse(data.state) : data.state;
        if (shellState.isChunked) {
            const auditIds = shellState.activeAuditIds || [];
            const findingIds = shellState.activeFindingIds || [];
            
            const chunkIds = [
                ...auditIds.map((id: string) => `chunk-audit-${id}`),
                ...findingIds.map((id: string) => `chunk-finding-${id}`)
            ];
            
            const reconstructedAudits: any = {};
            const reconstructedFindings: any = {};
            
            // Batch process chunks to avoid URL length limits
            for (let i = 0; i < chunkIds.length; i += 50) {
                const batchIds = chunkIds.slice(i, i + 50);
                const { data: chunksData } = await supabase
                    .from('app_state')
                    .select('id, state')
                    .in('id', batchIds);
                    
                if (chunksData) {
                    chunksData.forEach(row => {
                        if (row.id.startsWith('chunk-audit-')) {
                            if (row.state.audit) reconstructedAudits[row.state.audit.id] = row.state.audit;
                            // Backwards compatibility for monolithic chunks
                            if (row.state.findings) {
                                row.state.findings.forEach((f: any) => {
                                    reconstructedFindings[f.id] = f;
                                });
                            }
                        } else if (row.id.startsWith('chunk-finding-')) {
                            reconstructedFindings[row.state.id] = row.state;
                        }
                    });
                }
            }
            
            useStore.setState((state) => ({
              ...state,
              audits: { ...state.audits, ...reconstructedAudits },
              findings: { ...state.findings, ...reconstructedFindings }
            }));
        }
      }
    } catch (e) {
      console.error("Force sync failed", e);
      alert("Failed to sync with cloud. Please check your connection.");
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Auto-sync if the dashboard seems suspiciously empty (only default templates)
  // This automatically recovers the user from a failed hydration without requiring manual clicks
  useEffect(() => {
    if (isHydrated && Object.keys(audits).length <= 2) {
      handleForceSync();
    }
  }, [isHydrated]);

  const auditList = Object.values(audits)
    .filter(audit => !audit.isTemplate)
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );


  const filteredAuditList = auditList.filter(audit => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      audit.companyName?.toLowerCase().includes(q) ||
      audit.websiteUrl?.toLowerCase().includes(q) ||
      audit.primaryService?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAuditList.length / itemsPerPage);
  const currentAudits = filteredAuditList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-white/10 rounded mb-2"></div>
            <div className="h-4 w-64 bg-white/5 rounded"></div>
          </div>
          <div className="h-11 w-32 bg-white/10 rounded-full"></div>
        </div>
        <GlassPanel className="p-1 min-h-[400px]"><div /></GlassPanel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Recent Audits</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your client reports.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={handleForceSync}
            disabled={isSyncing}
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Force Cloud Sync"}
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-full h-11 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64"
            />
          </div>
          <Link href="/new">
            <Button className="bg-gradient-primary hover:opacity-90 rounded-full h-11 px-6 shadow-lg shadow-indigo-500/20">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Audit
            </Button>
          </Link>
        </div>
      </div>

      <GlassPanel className="p-1 min-h-[400px]">
        {filteredAuditList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
            <div className="h-16 w-16 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-indigo-400" />
            </div>
            <Link href="/new">
              <Button variant="secondary" className="rounded-full">
                Create First Audit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Company</div>
              <div className="col-span-3">Service</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            <div className="flex flex-col">
              {currentAudits.map((audit) => (
                <div 
                  key={audit.id} 
                  className="grid grid-cols-12 px-6 py-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/${audit.id}/edit`)}
                >
                  <div className="col-span-4 flex flex-col">
                    <span className="font-semibold text-white">{audit.companyName}</span>
                    <span className="text-sm text-muted-foreground">{audit.websiteUrl}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                      {audit.primaryService}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {activeEditors[audit.id] && activeEditors[audit.id].length > 0 ? (
                      <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse" title="Someone is currently editing this audit.">
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Editing: {activeEditors[audit.id].join(", ")}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">{audit.status}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    {deleteConfirmId === audit.id ? (
                      <div className="flex items-center gap-1 bg-red-500/90 rounded-md p-1 z-30">
                        <span className="text-xs font-bold text-white px-2">Sure?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteAudit(audit.id); setDeleteConfirmId(null); }}
                          className="text-xs font-bold text-white hover:bg-white/20 px-2 py-1 rounded"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                          className="text-xs font-bold text-white/70 hover:text-white hover:bg-white/20 px-2 py-1 rounded"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        {audit.status === "Approved" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-8 w-8 hover:bg-blue-500/20 hover:text-blue-400"
                              onClick={(e) => handleShareAudit(e, audit.id)}
                              disabled={sharingAuditId === audit.id}
                              title="Copy Public Link"
                            >
                              {sharedCopiedId === audit.id ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className={`h-4 w-4 ${sharingAuditId === audit.id ? 'animate-pulse' : ''}`} />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-8 w-8 hover:bg-green-500/20 hover:text-green-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/${audit.id}/present`);
                              }}
                              title="Present Audit"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 hover:bg-amber-500/20 hover:text-amber-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveAuditAsTemplate(audit.id);
                            alert("Template saved successfully! You can find it in the Templates section.");
                          }}
                          title="Save as Template"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 hover:bg-indigo-500/20 hover:text-indigo-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newId = cloneAudit(audit.id);
                            if (newId) {
                              router.push(`/${newId}/edit`);
                            }
                          }}
                          title="Duplicate Audit"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(audit.id);
                          }}
                          title="Delete Audit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAuditList.length)} of {filteredAuditList.length} results
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
