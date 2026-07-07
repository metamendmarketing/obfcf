"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Home() {
  const login = useStore((state) => state.login);
  const currentUser = useStore((state) => state.currentUser);
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(useStore.persist.hasHydrated());
    const unsub = useStore.persist.onFinishHydration(() => setIsHydrated(true));
    return () => unsub();
  }, []);

  // Redirect instantly if they are already logged in
  useEffect(() => {
    if (isHydrated && currentUser) {
      router.replace("/dashboard");
    }
  }, [isHydrated, currentUser, router]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please fill out all credentials.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(username, password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Invalid username or password.");
      }
    } catch (e) {
      setError("Failed to login. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isHydrated || currentUser) {
    return (
      <main className="flex min-h-screen bg-[#050505] flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img 
            src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" 
            alt="Metamend Logo" 
            className="h-10 w-auto opacity-80"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500/20"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />

      <div className="z-10 w-full max-w-5xl flex flex-col gap-12">
        <div className="flex items-center gap-3">
          <img 
            src="https://cdn.prod.website-files.com/68d35735b765c65d21f0175a/68ddd293bbc7a27b62507514_metamend_logo.png" 
            alt="Metamend Logo" 
            className="h-12 w-auto"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
              Audit Builder <br />
              <GradientText>Executive Edition</GradientText>
            </h1>
            <p className="text-lg text-muted-foreground font-serif max-w-xl leading-relaxed">
              This dashboard is private to Metamend and approved client stakeholders. Sign in below to access the agency view and client audits.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <GlassPanel className="p-8 md:p-12 flex flex-col gap-6 bg-[#0c0d1c]/85 border-white/5 shadow-2xl shadow-indigo-950/20">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                  Private Dashboard
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
                  Secure Access
                </h2>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                    Username
                  </label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder=""
                    autoComplete="username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      autoComplete="current-password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/60 leading-relaxed font-serif">
                Authorized Metamend staff only. Connection activities are logged and monitored.
              </p>

              <Button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-13 rounded-full bg-gradient-primary hover:opacity-90 text-white font-semibold text-base border-0 shadow-lg shadow-indigo-500/25 transition-all"
              >
                {isLoggingIn ? "Authenticating..." : "Enter Dashboard"}
              </Button>
            </GlassPanel>
          </form>
        </div>
      </div>
    </main>
  );
}
