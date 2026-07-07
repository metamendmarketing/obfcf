"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { GradientText } from "@/components/ui/GradientText";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { useStore } from "@/lib/store";
import { LogOut } from "lucide-react";
import { PresenceManager } from "@/components/ui/PresenceManager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);

  return (
    <AuthGuard>
      <PresenceManager />
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <img 
                  src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" 
                  alt="Metamend Logo" 
                  className="h-6 w-auto"
                />
                <span className="font-semibold text-lg border-l border-white/20 pl-2 ml-2">
                  Audit <GradientText>Builder</GradientText>
                </span>
              </Link>
            </div>
            
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link 
                href="/dashboard" 
                className={`transition-colors hover:text-white ${pathname === '/dashboard' ? 'text-white font-bold' : ''}`}
              >
                Audits
              </Link>
              <Link 
                href="/templates" 
                className={`transition-colors hover:text-white ${pathname === '/templates' ? 'text-white font-bold' : ''}`}
              >
                Templates
              </Link>
              <Link 
                href="/settings" 
                className={`transition-colors hover:text-white ${pathname === '/settings' ? 'text-white font-bold' : ''}`}
              >
                Settings
              </Link>
              
              <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
                <div className="flex flex-col text-right hidden sm:flex select-none">
                  <span className="text-xs font-semibold text-white truncate max-w-[150px]">{currentUser?.username}</span>
                  <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold leading-none mt-0.5">{currentUser?.role}</span>
                </div>
                
                {currentUser?.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-900 flex items-center justify-center border border-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase select-none">
                    {currentUser?.username?.substring(0, 2) || "ME"}
                  </div>
                )}
                
                <button 
                  onClick={logout}
                  className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-full transition-all duration-200"
                  title="Log Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto p-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
