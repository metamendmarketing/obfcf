import { ArrowDownRight } from "lucide-react";

export interface StageHeaderData {
  subheading?: string;
  heading: string;
  caption?: string;
}

export function StageHeaderBlock({ data }: { data: StageHeaderData }) {
  return (
    <div className="w-full relative z-20 py-8 px-16">
      {data.subheading && (
        <h2 className="text-xl font-bold tracking-[0.2em] text-gray-400 uppercase">
          {data.subheading}
        </h2>
      )}
      <div className="mt-1 flex items-end gap-3 border-b-[3px] border-black pb-2 inline-flex">
        <h1 className="text-3xl font-black text-black tracking-tight">
          {data.heading}
        </h1>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0057FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
          <line x1="7" y1="7" x2="17" y2="17"></line>
          <polyline points="17 7 17 17 7 17"></polyline>
        </svg>
      </div>
      {data.caption && (
        <div className="mt-5 border-l-4 border-[#0057FF] pl-5 py-0.5">
          <p className="text-lg text-black font-sans leading-relaxed">
            {data.caption}
          </p>
        </div>
      )}
    </div>
  );
}
