import React from "react";
import { useStore } from "@/lib/store";
import { AbstractWaves } from "../ui/AbstractWaves";
import { useParams } from "next/navigation";
import { InteractiveCoverLogo } from "../audit/InteractiveCoverLogo";
import { MetamendLogo } from "../ui/MetamendLogo";

export function CoverBlock({ audit: propAudit }: { audit?: any }) {
  const params = useParams();
  const auditId = params?.id as string;
  const storeAudit = useStore(state => state.audits[auditId]);
  const audit = propAudit || storeAudit;
  
  console.log("COVERBLOCK DEBUG:", { hasPropAudit: !!propAudit, hasStoreAudit: !!storeAudit, auditId });
  
  if (!audit) return null;

  return (
    <div className="w-[850px] min-h-[1100px] h-screen bg-black relative overflow-hidden flex flex-col font-sans page-break-after">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 80%, #111326 0%, transparent 60%)' }}></div>
      {/* Dynamic Wave Background */}
      <div className="absolute inset-0 z-0">
        <AbstractWaves />
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        {/* Interactive Cover Logos */}
        {audit.coverLogos?.map((logo: any) => (
          <InteractiveCoverLogo
            key={logo.id}
            id={logo.id}
            url={logo.url}
            initialX={logo.x}
            initialY={logo.y}
            initialWidth={logo.width}
            containerWidth={850}
            onUpdate={(logoId, updates) => {
              const currentLogos = useStore.getState().audits[auditId].coverLogos || [];
              const updatedLogos = currentLogos.map(l => l.id === logoId ? { ...l, ...updates } : l);
              useStore.getState().updateAudit(auditId, { coverLogos: updatedLogos });
            }}
            onDelete={(logoId) => {
              const currentLogos = useStore.getState().audits[auditId].coverLogos || [];
              useStore.getState().updateAudit(auditId, { coverLogos: currentLogos.filter(l => l.id !== logoId) });
            }}
          />
        ))}

        {/* Header / Meta Logo */}
        <div className="w-full flex justify-between items-center px-16 py-12">
          <MetamendLogo className="h-10 w-auto text-white opacity-90" />
          <div className="flex flex-col items-end">
            <span className="text-[#356af9] font-sans font-semibold text-xs tracking-[0.25em] uppercase">Confidential</span>
            <span className="text-white/40 text-xs mt-1">{new Date(audit.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center px-16">
          <div className="flex items-center justify-between gap-8 w-full mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-[#a774fd] font-sans font-bold tracking-[0.25em] uppercase text-xs mb-6 border-l-2 border-[#a774fd] pl-4">{audit.auditTitle || "Digital Strategy Audit"}</h2>
              <div className="text-white/50 text-xl tracking-wide mb-2">Prepared for</div>
              <h1 className={`text-[3.5rem] leading-[1.1] font-bold text-white tracking-tight break-words ${audit.hideCompanyName ? 'invisible' : ''}`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                  {audit.companyName}
                </span>
              </h1>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="w-24 h-1 mb-12" style={{ backgroundImage: 'linear-gradient(to right, #356af9, #a774fd, transparent)' }}></div>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-white/40 uppercase tracking-widest text-xs mb-2">Prepared By</h3>
                <p className="text-white text-lg">{audit.preparedBy}</p>
                <p className="text-white/60 text-sm mt-1">Metamend Strategy Team</p>
              </div>
              {audit.websiteUrl && (
                <div>
                  <h3 className="text-white/40 uppercase tracking-widest text-xs mb-2">Property</h3>
                  <p className="text-white text-lg">{audit.websiteUrl}</p>
                  <p className="text-white/60 text-sm mt-1">Primary Domain</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-16 py-12 flex justify-between items-end border-t border-white/10 mx-16">
          <div>
            <p className="text-white/40 text-xs">CONFIDENTIAL & PROPRIETARY</p>
            <p className="text-white/40 text-xs mt-1">© {new Date().getFullYear()} Metamend. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
