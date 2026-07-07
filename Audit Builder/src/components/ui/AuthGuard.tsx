"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isHeadless, setIsHeadless] = useState(false);

  useEffect(() => {
    // Check search params directly since useSearchParams can cause suspense boundary issues
    setIsHeadless(window.location.search.includes('headless=true'));
    setIsHydrated(useStore.persist.hasHydrated());
    const unsub = useStore.persist.onFinishHydration(() => setIsHydrated(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isHeadless) return;
    if (isHydrated && !currentUser) {
      router.replace("/");
    }
  }, [isHydrated, currentUser, router, isHeadless]);

  if (isHeadless) {
    return <>{children}</>;
  }

  if (!isHydrated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img 
            src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" 
            alt="Metamend Logo" 
            className="h-10 w-auto opacity-80"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500/20"></div>
          <span className="text-xs tracking-wider text-muted-foreground uppercase mt-2">
            Loading Dashboard...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
