import React from "react";

export interface TextBlockData {
  html: string;
}

export function TextBlock({ data }: { data: TextBlockData }) {
  return (
    <div className="px-16 mt-2 pb-0 z-20 w-full">
      <div className="font-sans text-[1.1rem] leading-[1.7] prose-report w-full">
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      </div>
    </div>
  );
}
