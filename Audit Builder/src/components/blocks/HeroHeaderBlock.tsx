import React from "react";

export interface HeroHeaderData {
  title: string;
  subtitle?: string;
  alignment: "left" | "right" | "center";
}

export function HeroHeaderBlock({ data, isPrint = false }: { data: HeroHeaderData; isPrint?: boolean }) {
  const alignClass = 
    data.alignment === "left" ? "mr-auto pl-16 pr-12" : 
    data.alignment === "right" ? "ml-auto px-12" : 
    "mx-auto px-12";

  return (
    <div className={`w-[92%] ${alignClass} bg-[#1a1a1a] ${isPrint ? 'print:bg-[#111]' : ''} text-white py-6 mb-6 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.75)] relative z-20`}>
      <h2 className="text-[2.4rem] font-bold mb-2 tracking-tight">{data.title}</h2>
      {data.subtitle && (
        <p className="text-[1.05rem] text-white/80 max-w-4xl leading-snug">
          {data.subtitle}
        </p>
      )}
    </div>
  );
}
