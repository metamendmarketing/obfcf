import React from 'react';

interface StandardServicesProps {
  primaryService: string;
}

export function StandardServices({ primaryService }: StandardServicesProps) {
  return (
    <section className="min-h-screen px-16 py-32 flex flex-col justify-center page-break-after bg-[#f8f9fa] print:bg-white relative z-10">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Massive Black Header Block */}
        <div className="bg-[#111] text-white p-12 shadow-2xl mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0057FF] opacity-20 blur-[100px] rounded-full mix-blend-screen"></div>
          <h2 className="text-5xl font-black tracking-tight leading-tight relative z-10">
            Recommended Organic<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {primaryService === 'SEO' ? 'SEO Setup' : primaryService + ' Strategy'}
            </span>
          </h2>
        </div>

        {/* Structured Service Cards */}
        <div className="flex flex-col gap-8">
          
          {/* Card 1 */}
          <div className="bg-white print:bg-gray-50 border border-gray-200 print:border-black/20 p-10 shadow-xl relative overflow-hidden group hover:border-[#0057FF]/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0057FF]"></div>
            <div className="flex gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">1. Quick-Win Audit – Implementation</h3>
                <p className="text-gray-600 font-serif text-lg leading-relaxed">
                  During our setup phase, our initial priority will be to implement and address the opportunities identified within your quick-win audit, as these changes will have the greatest positive impact on your site performance in the shortest amount of time. The positive impact from many of these improvements is not immediately realized; however, they often provide a substantial long-term ROI. Additionally, we will work closely with your developers/internal team to accomplish anything that we cannot implement ourselves.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity text-[#0057FF]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 17L8 12L13 7M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white print:bg-gray-50 border border-gray-200 print:border-black/20 p-10 shadow-xl relative overflow-hidden group hover:border-[#0057FF]/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0057FF]"></div>
            <div className="flex gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">2. Optimization Matrix</h3>
                <p className="text-gray-600 font-serif text-lg leading-relaxed">
                  Another important component of our organic setup is constructing an optimization matrix, which is a detailed spreadsheet used to inform our content optimization strategy. Firstly, we categorize all keywords from our keyword research based on user search intent, and or, by product category. We then assign these keyword groups to individual pages that best match the content topic/keyword theme. We will then use this as a basis to perform on-page SEO changes during our monthly services.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity text-[#0057FF]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 17L8 12L13 7M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white print:bg-gray-50 border border-gray-200 print:border-black/20 p-10 shadow-xl relative overflow-hidden group hover:border-[#0057FF]/50 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0057FF]"></div>
            <div className="flex gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">3. Content GAP Analysis</h3>
                <p className="text-gray-600 font-serif text-lg leading-relaxed">
                  The content GAP analysis is used to improve your long-term SEO strategy by identifying the gaps within your site's content, so that we can work towards capturing important traffic that would otherwise be lost to your competitors. This allows us to provide recommendations for content development, and the creation of new pages that can successfully rank for these underutilized keywords.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity text-[#0057FF]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 17L8 12L13 7M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
