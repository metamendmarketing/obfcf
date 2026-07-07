"use client";

import { GradientText } from "@/components/ui/GradientText";
import Link from "next/link";
import React, { useEffect } from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PresenceManager } from "@/components/ui/PresenceManager";

export default function AuditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      useStore.setState({ activeAuditId: id });
    }
    return () => {
      useStore.setState({ activeAuditId: null });
    };
  }, [id]);

  return (
    <AuthGuard>
      <PresenceManager />
      <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden print:h-auto print:w-auto print:overflow-visible print:bg-white">
        {/* Top Navbar for Workspace */}
        <header className="shrink-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md print:hidden">
          <div className="w-full px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <img 
                  src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" 
                  alt="Metamend Logo" 
                  className="h-5 w-auto"
                />
                <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m15 18-6-6 6-6"/></svg>
                  <span className="font-medium text-sm text-muted-foreground">Back to Dashboard</span>
                </div>
              </Link>
            </div>
            <div className="text-sm font-semibold tracking-wide">
              Audit <GradientText>Workspace</GradientText>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden print:overflow-visible print:h-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
