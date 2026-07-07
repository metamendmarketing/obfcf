import React from 'react';

export function Conclusion() {
  return (
    <section className="min-h-screen px-16 py-32 flex flex-col justify-center page-break-after bg-[#f8f9fa] print:bg-white relative z-10">
      
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        
        <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center mb-8 shadow-2xl relative">
           <div className="absolute inset-0 bg-[#0057FF] blur-xl opacity-30 rounded-full"></div>
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white relative z-10">
             <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>

        <h2 className="text-6xl font-black tracking-tight text-[#111] mb-8">
          Next Steps & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Conclusion</span>
        </h2>
        
        <p className="text-xl text-gray-600 font-serif leading-relaxed max-w-3xl mb-16">
          The friction points identified in this high-level audit are currently suppressing your digital growth and artificially inflating your customer acquisition costs. By partnering with Metamend to execute this strategy, we can systematically eliminate these technical roadblocks, elevate your brand authority, and turn your digital presence into a measurable revenue driver.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="bg-white border border-gray-200 p-8 shadow-lg hover:border-blue-500 transition-colors group">
            <span className="text-blue-600 font-black text-xl mb-4 block">01</span>
            <h3 className="text-xl font-bold text-black mb-2">Strategy Alignment</h3>
            <p className="text-gray-600">We will schedule a final review call to align on the priorities and timelines outlined in this audit.</p>
          </div>
          <div className="bg-white border border-gray-200 p-8 shadow-lg hover:border-blue-500 transition-colors group">
            <span className="text-blue-600 font-black text-xl mb-4 block">02</span>
            <h3 className="text-xl font-bold text-black mb-2">Onboarding</h3>
            <p className="text-gray-600">Upon agreement, our technical team will securely integrate with your platforms and begin the baseline setup.</p>
          </div>
          <div className="bg-white border border-gray-200 p-8 shadow-lg hover:border-blue-500 transition-colors group">
            <span className="text-blue-600 font-black text-xl mb-4 block">03</span>
            <h3 className="text-xl font-bold text-black mb-2">Execution</h3>
            <p className="text-gray-600">We immediately deploy the "Quick-Win" technical fixes while initiating the long-term content strategy.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
