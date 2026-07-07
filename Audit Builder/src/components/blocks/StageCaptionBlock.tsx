import React from "react";

export interface StageCaptionData {
  caption: string;
}

export function StageCaptionBlock({ data }: { data: StageCaptionData }) {
  if (!data.caption) return null;

  return (
    <div className="w-full relative z-20 pt-4 pb-1 px-16">
      <div className="border-l-[4px] border-[#0057FF] pl-5 py-0.5">
        <p className="text-lg text-black font-sans leading-relaxed">
          {data.caption}
        </p>
      </div>
    </div>
  );
}
