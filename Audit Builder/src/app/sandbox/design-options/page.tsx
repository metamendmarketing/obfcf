import React from "react";
import Link from "next/link";

const MetamendLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 508.8 96" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m 108,580.09 c 0,20.121 16.094,34.601 39.43,34.601 h 12.875 c 28.168,0 35.406,-12.871 47.48,-41.039 L 344.586,270.281 482.188,573.652 c 12.074,28.168 19.32,41.039 47.476,41.039 h 11.27 c 23.336,0 39.429,-14.48 39.429,-34.601 V 112.559 c 0,-16.8988 -7.242,-24.9535 -23.336,-24.9535 h -6.433 c -15.293,0 -22.535,8.0547 -22.535,24.9535 V 551.93 L 391.258,254.988 c -9.656,-21.726 -20.922,-34.605 -47.477,-34.605 -27.363,0 -37.82,12.879 -47.476,34.605 l -136,296.942 V 112.559 c 0,-16.8988 -6.438,-24.9535 -22.532,-24.9535 h -8.046 C 114.441,87.6055 108,95.6602 108,112.559 V 580.09" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 986.695,312.926 c -4.824,75.637 -51.504,124.73 -123.121,124.73 -72.426,0 -127.945,-51.5 -139.211,-124.73 z M 863.574,483.523 c 107.828,0 178.646,-76.449 178.646,-193.128 v -4.832 c 0,-14.477 -5.63,-17.704 -21.73,-17.704 H 722.758 c 4.015,-82.078 63.566,-140.011 145.64,-140.011 74.844,0 108.641,32.179 131.172,68.39 1.61,2.422 30.58,-4.816 30.58,-29.769 0,-26.551 -57.939,-85.301 -161.752,-85.301 -116.671,0 -197.953,82.086 -197.953,199.574 0,116.684 82.082,202.781 193.129,202.781" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 1147.6,427.195 h -35.41 c -19.31,0 -24.94,7.243 -24.94,20.918 v 4.836 c 0,13.676 5.63,20.918 24.94,20.918 h 35.41 v 66.793 c 0,19.313 9.66,24.949 23.34,24.949 h 5.63 c 13.68,0 22.53,-5.636 22.53,-24.949 v -66.793 h 102.2 c 19.32,0 24.95,-7.242 24.95,-20.918 v -4.836 c 0,-13.675 -5.63,-20.918 -24.95,-20.918 H 1199.1 V 209.121 c 0,-56.332 14.49,-82.883 57.13,-82.883 26.56,0 45.88,11.262 59.55,28.16 1.61,1.614 17.71,-5.628 17.71,-25.75 0,-21.73 -28.17,-47.48 -78.86,-47.48 -74.84,0 -107.03,42.648 -107.03,122.324 v 223.703" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 1519.69,125.023 c 78.87,0 137.61,49.094 137.61,117.493 v 35.406 l -22.53,-0.805 c -131.17,-4.828 -198.76,-28.172 -198.76,-88.523 0,-38.617 31.38,-63.571 83.68,-63.571 z m 129.56,193.938 h 8.05 v 13.68 c 0,65.988 -38.63,102.199 -107.83,102.199 -61.96,0 -101.39,-31.387 -122.32,-70.82 0,-0.801 -29.77,2.421 -29.77,30.582 0,27.363 54.72,88.523 156.11,88.523 97.37,0 155.31,-56.332 155.31,-148.879 V 92.832 c 0,-1.6054 -8.05,-5.6289 -17.7,-5.6289 -17.7,0 -33,8.8516 -33,50.7029 v 14.477 c -30.57,-44.258 -82.07,-70.8127 -143.23,-70.8127 -83.69,0 -131.97,42.6527 -131.97,107.0237 0,89.328 89.32,126.344 266.35,130.367" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 1804.19,471.453 c 0,1.613 8.05,5.637 17.7,5.637 17.71,0 33.81,-8.852 33.81,-50.703 v -9.653 c 26.55,38.621 69.19,66.789 120.7,66.789 60.35,0 106.22,-28.168 127.15,-82.078 25.75,45.868 72.42,82.078 135.99,82.078 96.57,0 148.06,-55.527 148.06,-161.742 V 112.559 c 0,-19.3207 -9.65,-24.9535 -23.33,-24.9535 h -5.64 c -13.68,0 -23.33,5.6328 -23.33,24.9535 v 206.004 c 0,76.441 -32.99,115.875 -98.98,115.875 -47.48,0 -91.74,-31.379 -114.27,-77.254 V 112.559 c 0,-19.3207 -9.66,-24.9535 -23.34,-24.9535 h -5.62 c -13.68,0 -23.34,5.6328 -23.34,24.9535 v 201.976 c 0,80.469 -33,119.903 -98.99,119.903 -47.47,0 -91.73,-31.379 -114.26,-77.254 V 112.559 c 0,-19.3207 -9.66,-24.9535 -23.34,-24.9535 h -5.63 c -13.68,0 -23.34,5.6328 -23.34,24.9535 v 358.894" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 2782.66,312.926 c -4.83,75.637 -51.5,124.73 -123.12,124.73 -72.42,0 -127.96,-51.5 -139.22,-124.73 z m -123.12,170.597 c 107.83,0 178.65,-76.449 178.65,-193.128 v -4.832 c 0,-14.477 -5.64,-17.704 -21.73,-17.704 h -297.75 c 4.03,-82.078 63.58,-140.011 145.66,-140.011 74.83,0 108.63,32.179 131.16,68.39 1.61,2.422 30.59,-4.816 30.59,-29.769 0,-26.551 -57.94,-85.301 -161.75,-85.301 -116.68,0 -197.96,82.086 -197.96,199.574 0,116.684 82.08,202.781 193.13,202.781" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 2919.43,471.453 c 0,1.613 8.04,5.637 17.7,5.637 17.71,0 33.79,-8.852 33.79,-50.703 v -12.871 c 26.56,41.039 70.82,70.007 130.37,70.007 101.39,0 152.09,-67.593 152.09,-168.988 V 112.559 c 0,-19.3207 -9.66,-24.9535 -23.34,-24.9535 h -5.63 c -13.68,0 -23.34,5.6328 -23.34,24.9535 v 198.754 c 0,76.453 -37.82,123.125 -103,123.125 -59.54,0 -103.81,-32.993 -126.34,-81.274 V 112.559 c 0,-19.3207 -9.66,-24.9535 -23.34,-24.9535 h -5.62 c -13.69,0 -23.34,5.6328 -23.34,24.9535 v 358.894" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
    <path d="m 3518.9,127.043 c 70.01,0 134.38,52.309 137.6,123.117 v 97.375 c -24.14,55.524 -68.4,90.121 -135.99,90.121 -81.28,0 -135.2,-62.769 -135.2,-155.301 0,-90.132 56.33,-155.312 133.59,-155.312 z m -2.41,356.48 c 67.58,0 116.68,-32.183 139.21,-67.593 v 217.273 c 0,1.606 8.05,5.629 17.7,5.629 17.7,0 34.6,-8.852 34.6,-50.691 V 112.559 c 0,-19.3207 -9.65,-24.9535 -23.33,-24.9535 h -5.64 c -13.68,0 -22.53,5.6328 -22.53,24.9535 v 41.839 c -34.6,-46.668 -79.66,-73.23 -143.24,-73.23 -101.39,0 -181.06,78.859 -181.06,200.375 0,120.703 78.07,201.98 184.29,201.98" transform="matrix(0.13333333,0,0,-0.13333333,0,96)" />
  </svg>
);

const PdfSafeWave = () => (
  <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" fill="none">
    {/* Clean vector paths with solid colors and NO mix-blend-modes or CSS filters to ensure 100% crisp PDF vector rendering */}
    <path d="M 0 800 C 400 900, 600 200, 1000 100 L 1000 1000 L 0 1000 Z" fill="#356af9" opacity="0.1" />
    <path d="M 0 850 C 300 950, 700 300, 1000 150 L 1000 1000 L 0 1000 Z" fill="#a774fd" opacity="0.1" />
    <path d="M 0 900 C 500 1000, 800 400, 1000 250 L 1000 1000 L 0 1000 Z" fill="#356af9" opacity="0.15" />
    <line x1="0" y1="0" x2="1000" y2="1000" stroke="white" strokeWidth="1" opacity="0.05" />
    <line x1="200" y1="0" x2="1000" y2="800" stroke="white" strokeWidth="1" opacity="0.05" />
  </svg>
);

const Option1 = () => (
  <div className="w-[850px] min-h-[1100px] bg-[#0A0A0A] relative overflow-hidden flex flex-col font-sans border border-white/20 shadow-2xl shrink-0">
    <div className="absolute inset-0 z-0 opacity-80" style={{ backgroundImage: 'linear-gradient(to bottom right, #0A0A0A, #0A0A0A, #1a1c3b)' }}></div>
    <PdfSafeWave />
    <div className="flex-1 flex flex-col relative z-10">
      <div className="w-full flex justify-between items-center px-16 py-12">
        <MetamendLogo className="h-8 w-auto text-white opacity-90" />
        <div className="flex flex-col items-end">
          {/* Changed from font-mono to modern sans-serif with wide tracking, using brand primary */}
          <span className="text-[#356af9] font-sans font-semibold text-xs tracking-[0.25em] uppercase">Confidential</span>
          <span className="text-white/40 text-xs mt-1">May 29, 2026</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-16">
        <div className="flex items-center justify-between gap-8 w-full mb-8">
          <div className="flex-1 min-w-0">
            {/* Replaced Atari font with elegant, sleek uppercase sans-serif using brand secondary */}
            <h2 className="text-[#a774fd] font-sans font-bold tracking-[0.25em] uppercase text-xs mb-6 border-l-2 border-[#a774fd] pl-4">Digital Strategy Audit</h2>
            <div className="text-white/50 text-xl tracking-wide mb-2">Prepared for</div>
            <h1 className="text-[3.5rem] leading-[1.1] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight break-words">
              Valtir Rentals
            </h1>
          </div>
        </div>
        <div className="max-w-2xl">
          <div className="w-24 h-1 mb-12" style={{ backgroundImage: 'linear-gradient(to right, #356af9, #a774fd, transparent)' }}></div>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h3 className="text-white/40 uppercase tracking-widest text-xs mb-2 font-semibold">Prepared By</h3>
              <p className="text-white text-lg">Matthew</p>
              <p className="text-white/60 text-sm mt-1">Metamend Strategy Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Option2 = () => (
  <div className="w-[850px] min-h-[1100px] bg-[#050505] relative overflow-hidden flex flex-col font-sans border border-white/20 shadow-2xl shrink-0">
    {/* Ultra minimal solid background. Safest possible option for crisp PDFs. */}
    <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    <div className="flex-1 flex flex-col relative z-10">
      <div className="w-full flex justify-between items-center px-16 py-12">
        <MetamendLogo className="h-5 w-auto text-white opacity-100" />
        <div className="flex flex-col items-end">
          <span className="text-indigo-400 font-sans font-medium text-xs tracking-[0.2em] uppercase">Confidential</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-16">
        <div className="max-w-2xl">
          <h2 className="text-indigo-400 font-sans font-medium tracking-[0.3em] uppercase text-xs mb-8">Digital Strategy Audit</h2>
          <h1 className="text-[4rem] leading-[1.05] font-light text-white tracking-tight break-words mb-12">
            Valtir Rentals
          </h1>
          <div className="w-full h-[1px] bg-white/10 mb-12"></div>
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white/30 uppercase tracking-widest text-[10px] mb-1 font-bold">Prepared By</h3>
              <p className="text-white text-base">Metamend Strategy Team</p>
            </div>
            <div>
              <h3 className="text-white/30 uppercase tracking-widest text-[10px] mb-1 font-bold">Date</h3>
              <p className="text-white text-base">May 29, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Option3 = () => (
  <div className="w-[850px] min-h-[1100px] bg-slate-900 relative overflow-hidden flex flex-col font-sans border border-white/20 shadow-2xl shrink-0">
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
    {/* Bold geometric structure */}
    <div className="absolute right-0 top-0 w-1/3 h-full bg-[#0057FF]/10 border-l border-white/5"></div>
    <div className="flex-1 flex flex-col relative z-10">
      <div className="w-full flex justify-between items-center px-16 py-12">
        <MetamendLogo className="h-6 w-auto text-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center px-16">
        <div className="bg-white/5 backdrop-blur-none border border-white/10 p-12 rounded-xl max-w-2xl">
          <h2 className="text-blue-400 font-sans font-bold tracking-[0.2em] uppercase text-xs mb-4">Digital Strategy Audit</h2>
          <div className="text-white/50 text-sm tracking-wide mb-2">Prepared for</div>
          <h1 className="text-[3rem] leading-[1.1] font-bold text-white tracking-tight break-words mb-8">
            Valtir Rentals
          </h1>
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div>
              <h3 className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Author</h3>
              <p className="text-white/80 text-sm">Matthew</p>
            </div>
            <div>
              <h3 className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Date</h3>
              <p className="text-white/80 text-sm">May 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function DesignOptions() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-12 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold mb-4">PDF Design Solutions</h1>
          <p className="text-neutral-400 max-w-3xl leading-relaxed">
            These coded examples preserve the Metamend dark theme but solve the core issues: <br/><br/>
            <strong>1. Pixelation:</strong> The previous background used CSS blur filters and `mix-blend-mode`. These force Chrome's PDF engine to flatten the page into a low-res image, destroying font clarity. These options use PDF-safe pure CSS and standard SVGs ensuring 100% vector sharpness. <br/>
            <strong>2. Atari Font:</strong> The `font-mono` classes have been swapped for sleek, widely-spaced modern sans-serif fonts.<br/>
            <strong>3. Logo:</strong> Replaced the pixelated PNG with a pure, scalable SVG text logo.<br/>
            <strong>4. Legibility:</strong> Backgrounds are less chaotic, making the white text pop beautifully.
          </p>
        </div>

        <div className="flex gap-12 pb-12 w-max">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Option 1: The Modern Refine</h3>
            <p className="text-neutral-500 mb-6 w-[850px]">Keeps the original layout and color scheme, but replaces the blurry particles with clean vector waves. The Atari font is replaced with a sleek, tracked-out sans-serif.</p>
            <Option1 />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Option 2: Ultra Minimal</h3>
            <p className="text-neutral-500 mb-6 w-[850px]">Stripped back completely to ensure maximum PDF sharpness. Uses a subtle dot grid and heavy reliance on beautiful typography and whitespace.</p>
            <Option2 />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Option 3: Structural Card</h3>
            <p className="text-neutral-500 mb-6 w-[850px]">Uses a slight slate-blue tone and a structured border box to give the cover page depth and framing without relying on messy background graphics.</p>
            <Option3 />
          </div>
        </div>
      </div>
    </div>
  );
}
