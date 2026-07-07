import React from 'react';
import { Inter, Plus_Jakarta_Sans, Lora, Merriweather, Roboto_Flex, Outfit } from "next/font/google";
import { MetamendLogo } from "@/components/ui/MetamendLogo";

// Initialize fonts
const inter = Inter({ subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" });
const roboto = Roboto_Flex({ subsets: ["latin"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], display: "swap" });

const SAMPLE_TEXT = `A review of competitor ads triggered by queries like "strip brushes" shows relatively limited competition in paid search. Note however that to fully capitalize on this gap, product pages must be properly optimized to support conversion and Quality Score. Given the current quality of competitor ads, Sealeze is well positioned to launch a search campaign that outperforms the field. With a few targeted landing page adjustments, the brand could convert that advantage into measurable gains.`;

export default function TypographySandbox() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] p-16 font-sans text-black">
      <div className="max-w-5xl mx-auto space-y-16">
        
        <div className="mb-12 border-b border-gray-300 pb-8 flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Typography Sandbox</h1>
                <p className="text-gray-500 text-lg">Evaluating body copy for maximum crispness and PDF legibility.</p>
            </div>
            <MetamendLogo className="h-8 text-black" />
        </div>

        {/* Option 1: Inter */}
        <div className="bg-white p-12 shadow-xl border-l-[6px] border-[#356af9]">
          <div className="mb-8 flex justify-between items-end border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-black">Option 1: Inter</h2>
              <p className="text-sm text-gray-500 mt-1">The gold standard for modern UI. Extremely crisp, neutral, and readable at any size.</p>
            </div>
            <span className="text-xs font-bold tracking-widest text-[#356af9] uppercase">Recommended</span>
          </div>
          <div className={inter.className}>
            <h3 className="text-xl font-bold mb-4">Step 2: Landing Page Optimization</h3>
            <p className="text-[1.1rem] leading-[1.7] text-[#222]">{SAMPLE_TEXT}</p>
          </div>
        </div>

        {/* Option 2: Plus Jakarta Sans */}
        <div className="bg-white p-12 shadow-xl border-l-[6px] border-[#a774fd]">
          <div className="mb-8 flex justify-between items-end border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-black">Option 2: Plus Jakarta Sans</h2>
              <p className="text-sm text-gray-500 mt-1">A more geometric, premium sans-serif. Slightly wider stance, feels very high-end and airy.</p>
            </div>
          </div>
          <div className={jakarta.className}>
            <h3 className="text-xl font-bold mb-4">Step 2: Landing Page Optimization</h3>
            <p className="text-[1.1rem] leading-[1.7] text-[#222]">{SAMPLE_TEXT}</p>
          </div>
        </div>

        {/* Option 3: Roboto Flex */}
        <div className="bg-white p-12 shadow-xl border-l-[6px] border-black">
          <div className="mb-8 flex justify-between items-end border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-black">Option 3: Roboto Flex</h2>
              <p className="text-sm text-gray-500 mt-1">Google's highly engineered workhorse. Slightly taller x-height makes it incredibly sharp for print.</p>
            </div>
          </div>
          <div className={roboto.className}>
            <h3 className="text-xl font-bold mb-4">Step 2: Landing Page Optimization</h3>
            <p className="text-[1.1rem] leading-[1.7] text-[#222]">{SAMPLE_TEXT}</p>
          </div>
        </div>

        {/* The Current Baseline (Outfit) */}
        <div className="bg-gray-100 p-12 shadow-sm border border-gray-300">
          <div className="mb-8 flex justify-between items-end border-b border-gray-300 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-700">Baseline: Outfit (Current)</h2>
              <p className="text-sm text-gray-500 mt-1">Your current font. It is stylish for massive headers, but can feel slightly soft/rounded for dense paragraphs.</p>
            </div>
          </div>
          <div className={outfit.className}>
            <h3 className="text-xl font-bold mb-4">Step 2: Landing Page Optimization</h3>
            <p className="text-[1.1rem] leading-[1.7] text-[#222]">{SAMPLE_TEXT}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
