export type WavePattern = "cover" | "toc" | "onboarding" | "thankYou";

export function AbstractWaves({ variant = "dark", pattern = "cover", noMask = false }: { variant?: "dark" | "light", pattern?: WavePattern, noMask?: boolean }) {
  const isLight = variant === "light";
  
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
      {/* 
        CRITICAL PDF FIX:
        This component MUST NOT use `filter: blur()`, `mix-blend-mode`, or complex gradients with stops that overlap text.
        Using those features forces Chromium's PDF engine to rasterize the entire page, causing severe font pixelation.
        We use pure, solid-fill SVG paths with low opacities to ensure 100% crisp vector PDF generation.
      */}
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Abstract structural paths based on pattern */}
        {pattern === "cover" && (
          <>
            <path d="M 0 800 C 400 900, 600 200, 1000 100 L 1000 1000 L 0 1000 Z" fill={isLight ? "#356af9" : "#356af9"} opacity={isLight ? "0.05" : "0.1"} />
            <path d="M 0 850 C 300 950, 700 300, 1000 150 L 1000 1000 L 0 1000 Z" fill={isLight ? "#a774fd" : "#a774fd"} opacity={isLight ? "0.05" : "0.1"} />
            <path d="M 0 900 C 500 1000, 800 400, 1000 250 L 1000 1000 L 0 1000 Z" fill={isLight ? "#356af9" : "#356af9"} opacity={isLight ? "0.08" : "0.15"} />
          </>
        )}
        
        {pattern === "toc" && (
          <>
            <path d="M 0 0 C 600 200, 200 600, 800 1000 L 0 1000 Z" fill="#356af9" opacity={isLight ? "0.05" : "0.1"} />
            <path d="M 0 100 C 700 300, 300 700, 900 1000 L 0 1000 Z" fill="#a774fd" opacity={isLight ? "0.05" : "0.1"} />
            <path d="M 0 200 C 800 400, 400 800, 1000 1000 L 0 1000 Z" fill="#356af9" opacity={isLight ? "0.08" : "0.15"} />
          </>
        )}

        {pattern === "onboarding" && (
          <>
            <path d="M 0 0 C 500 200, 800 600, 1000 1000 L 0 1000 Z" fill="#356af9" opacity={isLight ? "0.05" : "0.1"} />
            <path d="M 1000 0 C 500 200, 200 600, 0 1000 L 0 0 Z" fill="#a774fd" opacity={isLight ? "0.03" : "0.06"} />
            <circle cx="500" cy="500" r="400" fill="none" stroke="#356af9" strokeWidth="2" opacity={isLight ? "0.05" : "0.1"} />
          </>
        )}

        {pattern === "thankYou" && (
          <>
            <path d="M 0 0 C 400 300, 600 300, 1000 0 L 1000 1000 L 0 1000 Z" fill="#356af9" opacity={isLight ? "0.03" : "0.05"} />
            <path d="M 0 100 C 400 400, 600 400, 1000 100 L 1000 1000 L 0 1000 Z" fill="#a774fd" opacity={isLight ? "0.04" : "0.08"} />
            <path d="M 0 200 C 400 500, 600 500, 1000 200 L 1000 1000 L 0 1000 Z" fill="#356af9" opacity={isLight ? "0.06" : "0.1"} />
          </>
        )}
        
        {/* Subtle structural grid lines */}
        <line x1="0" y1="0" x2="1000" y2="1000" stroke={isLight ? "black" : "white"} strokeWidth="1" opacity={isLight ? "0.03" : "0.05"} />
        <line x1="200" y1="0" x2="1000" y2="800" stroke={isLight ? "black" : "white"} strokeWidth="1" opacity={isLight ? "0.03" : "0.05"} />
      </svg>
      
    </div>
  );
}
