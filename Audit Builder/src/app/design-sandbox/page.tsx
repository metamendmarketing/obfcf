"use client";

import React from 'react';
import { AbstractWaves } from '@/components/ui/AbstractWaves';

// Sample HTML payload representing the rich text output for the onboarding steps
const mockHtml = `
  <ol>
    <li>
      <p><strong>Client Insights & Discovery</strong></p>
      <p>We begin by thoroughly understanding your business model, target audience, and current digital footprint to establish a baseline.</p>
    </li>
    <li>
      <p><strong>Quick Win Audit</strong></p>
      <p>Immediate identification of high-impact, low-effort technical and content opportunities that can move the needle quickly.</p>
    </li>
    <li>
      <p><strong>Keyword Strategy Mapping</strong></p>
      <p>Deep-dive research into high-intent search queries that align with your most profitable services and products.</p>
    </li>
    <li>
      <p><strong>Initial Conversion Tracking</strong></p>
      <p>Setting up robust analytics and goal tracking to ensure we can measure the ROI of every organic visitor.</p>
    </li>
    <li>
      <p><strong>Baseline Reporting & Alignment</strong></p>
      <p>Presenting the initial findings and aligning on the strategic roadmap for the upcoming months of the campaign.</p>
    </li>
  </ol>
`;

export default function DesignSandbox() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-12 flex flex-col gap-24 items-center">
      
      <div className="text-center max-w-2xl mb-8">
        <h1 className="text-4xl font-bold mb-4 text-[#0057FF]">SEO Onboarding Design Concepts</h1>
        <p className="text-white/60">Review the three concepts below. They all use the exact same Rich Text HTML payload from the editor, but style it using different CSS architectures.</p>
      </div>

      {/* CONCEPT 1: The Modern Timeline (Vertical Track) */}
      <div className="w-[850px] bg-white text-black overflow-hidden relative shadow-2xl rounded-xl border border-white/20">
        <div className="bg-[#0057FF] text-white p-12 pb-24 relative">
           <h2 className="text-[3rem] font-bold tracking-tight mb-2">Concept 1: The Pathway</h2>
           <p className="text-white/80 text-xl">A sleek, connected vertical timeline showing progression.</p>
        </div>
        <div className="px-16 -mt-12 relative z-10 pb-16 bg-white rounded-t-[3rem]">
          <div className="pt-12 concept-1-styles">
            <div dangerouslySetInnerHTML={{ __html: mockHtml }} />
          </div>
        </div>
      </div>

      {/* CONCEPT 2: The Grid Matrix (Card Based) */}
      <div className="w-[850px] bg-[#f4f5f7] text-black overflow-hidden relative shadow-2xl rounded-xl border border-white/20">
        <div className="p-16 pb-8">
           <div className="w-16 h-2 bg-[#0057FF] mb-6"></div>
           <h2 className="text-[3.5rem] font-bold tracking-tight mb-2 leading-none">Concept 2:<br/>The Grid Matrix</h2>
           <p className="text-black/60 text-lg mt-4">Breaking the list into distinct, digestible cards.</p>
        </div>
        <div className="px-16 pb-16">
          <div className="concept-2-styles">
            <div dangerouslySetInnerHTML={{ __html: mockHtml }} />
          </div>
        </div>
      </div>

      {/* CONCEPT 3: The Split Focus (Editorial) */}
      <div className="w-[850px] bg-white text-black overflow-hidden relative shadow-2xl rounded-xl border border-white/20">
        <div className="flex h-full min-h-[600px]">
          <div className="w-2/5 bg-[#111] text-white p-12 relative">
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                <AbstractWaves variant="dark" noMask />
             </div>
             <div className="relative z-10 sticky top-12">
               <h2 className="text-[3rem] font-bold tracking-tight leading-none mb-6">Concept 3:<br/>Split Focus</h2>
               <p className="text-white/60">An editorial, two-column layout with high contrast.</p>
             </div>
          </div>
          <div className="w-3/5 p-12 bg-white">
            <div className="concept-3-styles">
              <div dangerouslySetInnerHTML={{ __html: mockHtml }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
