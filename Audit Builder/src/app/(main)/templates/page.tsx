"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/button";
import { Bookmark, FileText, Trash2, Edit2, FilePlus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const audits = useStore((state) => state.audits);
  const deleteAudit = useStore((state) => state.deleteAudit);
  const currentUser = useStore((state) => state.currentUser);
  const router = useRouter();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  
  const templateList = Object.values(audits)
    .filter(audit => audit.isTemplate)
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const filteredTemplateList = templateList.filter(audit => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      audit.companyName?.toLowerCase().includes(q) ||
      audit.primaryService?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredTemplateList.length / itemsPerPage);
  const currentTemplates = filteredTemplateList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Audit Templates</h1>
          <p className="text-muted-foreground mt-1">Manage your base templates or start a new client audit from one.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-full h-11 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64"
          />
        </div>
      </div>

      <GlassPanel className="p-1 min-h-[400px]">
        {filteredTemplateList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
            <div className="h-16 w-16 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No templates yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You can save any existing audit as a template from the editor to use it as a starting point for future clients.
            </p>
            <Link href="/dashboard">
              <Button variant="secondary" className="rounded-full">
                Go to Audits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Template Name</div>
              <div className="col-span-3">Base Service</div>
              <div className="col-span-2">Last Updated</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="flex flex-col">
              {currentTemplates.map((audit) => (
                <div 
                  key={audit.id} 
                  className="grid grid-cols-12 px-6 py-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/new?templateId=${audit.id}`)}
                  title="Use this template for a new audit"
                >
                  <div className="col-span-5 flex flex-col">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-amber-400 fill-current" />
                      {audit.companyName}
                    </span>
                    <span className="text-sm text-muted-foreground ml-6">Base structure</span>
                  </div>
                  <div className="col-span-3">
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                      {audit.primaryService}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(audit.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/new?templateId=${audit.id}`);
                          }}
                          title="Use Template"
                        >
                          <FilePlus className="h-4 w-4" />
                        </Button>

                        {currentUser?.role === 'admin' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-8 w-8 hover:bg-white/10 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/${audit.id}/edit`);
                              }}
                              title="Edit Template Source"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(audit.id);
                              }}
                              title="Delete Template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTemplateList.length)} of {filteredTemplateList.length} results
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
