import React from 'react';
import { AbstractWaves } from "../ui/AbstractWaves";
import { MetamendLogo } from "../ui/MetamendLogo";

interface ThankYouData {
  name: string;
  phone: string;
  email: string;
  website: string;
}

export function ThankYouBlock({ data }: { data: ThankYouData }) {
  return (
    <div className="w-full h-[1100px] bg-[#0A0A0A] flex flex-col justify-end p-16 pb-12 text-white relative z-10 font-sans overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to bottom right, #0A0A0A, #0A0A0A, #111326)' }}></div>
      {/* Dynamic Wave Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AbstractWaves noMask pattern="thankYou" />
      </div>

      {/* Bottom Content Area */}
      <div className="flex flex-col w-full relative z-10">
        {/* Contact & Metamend Logo Row */}
        <div className="flex justify-between items-end mb-24 pr-4">
          {/* Contact Info (Left) */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[5rem] font-light text-[#356af9] mb-6 tracking-tight">Thank you.</h1>
            <p className="text-[1.4rem] leading-relaxed font-light text-white tracking-wide">{data.name}</p>
            <p className="text-[1.4rem] leading-relaxed font-light text-white tracking-wide">{data.phone}</p>
            <p className="text-[1.4rem] leading-relaxed font-light text-white tracking-wide">{data.email}</p>
            <p className="text-[1.4rem] leading-relaxed font-light text-white tracking-wide">{data.website}</p>
          </div>

          {/* Metamend Logo (Right) */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-64">
              <MetamendLogo className="w-full h-auto text-white opacity-90" />
            </div>
          </div>
        </div>

        {/* Client Logos Strip (Bottom Centered) */}
        <div className="w-full flex justify-center items-center opacity-90">
          <img src="/audits/client-logos.png" alt="Client Logos" className="h-16 w-auto object-contain" />
        </div>
      </div>
    </div>
  );
}
