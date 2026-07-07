export function AbstractMesh({ variant = "dark", noMask = false }: { variant?: "dark" | "light", noMask?: boolean }) {
  const isLight = variant === "light";
  
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
      {/* Base Gradient Glows - Moved to Bottom Left */}
      <div className={`absolute -bottom-[20%] -left-[20%] w-[100%] h-[100%] rounded-full filter blur-[120px] ${isLight ? 'mix-blend-normal opacity-40 bg-blue-500' : 'mix-blend-screen opacity-40 bg-blue-600'}`}></div>
      <div className={`absolute bottom-[0%] left-[0%] w-[60%] h-[60%] rounded-full filter blur-[100px] ${isLight ? 'mix-blend-normal opacity-50 bg-indigo-500' : 'mix-blend-screen opacity-20 bg-indigo-600'}`}></div>
      
      <svg
        className="absolute w-full h-full opacity-100"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="meshGrad" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isLight ? "#0057FF" : "#3B82F6"} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isLight ? "#6366F1" : "#8B5CF6"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isLight ? "#0057FF" : "#3B82F6"} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Highly Structured Geometric Data Orbits - Anchored Bottom Left */}
        <g>
          {/* 1. Radial Spoke Lines (Data Streams) */}
          {Array.from({ length: 16 }).map((_, i) => {
            // Shoot lines outward from bottom left focal point (-100, 1100)
            // Sweep from -90 degrees (up) to 0 degrees (right)
            const angle = (-90 + (i * 6)) * (Math.PI / 180); 
            const x2 = -100 + Math.cos(angle) * 2000;
            const y2 = 1100 + Math.sin(angle) * 2000;
            
            return (
              <line 
                key={`spoke-${i}`}
                x1="-100" y1="1100" 
                x2={x2} y2={y2} 
                stroke="url(#meshGrad)" 
                strokeWidth={isLight ? "1" : "0.5"} 
                strokeOpacity={isLight ? 0.3 : 0.2} 
              />
            );
          })}

          {/* 2. Concentric Orbital Rings (Purple Emphasis) */}
          {Array.from({ length: 14 }).map((_, i) => {
            // Perfectly spaced expanding rings
            const r = 150 + (i * 100);
            return (
              <circle 
                key={`orbit-${i}`}
                cx="-100" cy="1100" r={r} 
                stroke={isLight ? "#6366F1" : "#8B5CF6"} 
                strokeWidth={isLight ? "1.5" : "1"} 
                strokeOpacity={isLight ? 0.8 - (i * 0.05) : 0.4 - (i * 0.03)} 
                fill="none" 
              />
            );
          })}

          {/* 3. Intersection Nodes (Subtle Blue Points) */}
          {Array.from({ length: 14 }).map((_, ringIndex) => {
            const r = 150 + (ringIndex * 100);
            return Array.from({ length: 16 }).map((_, spokeIndex) => {
              // Only draw dots at specific intersections to create a deliberate pattern
              if ((ringIndex + spokeIndex) % 2 === 0) {
                const angle = (-90 + (spokeIndex * 6)) * (Math.PI / 180);
                const cx = -100 + Math.cos(angle) * r;
                const cy = 1100 + Math.sin(angle) * r;
                
                return (
                  <circle 
                    key={`node-${ringIndex}-${spokeIndex}`}
                    cx={cx} cy={cy} r="2" 
                    fill={isLight ? "#0057FF" : "#60A5FA"} 
                    fillOpacity={isLight ? 0.5 : 0.3} 
                  />
                );
              }
              return null;
            });
          })}
        </g>
      </svg>
      
      {/* Edge Fade Masks - Identical to AbstractWaves */}
      {!noMask && (
        <>
          <div className={`absolute -inset-4 bg-gradient-to-r ${isLight ? 'from-[#f4f5f7]/0 via-[#f4f5f7]/60 to-[#f4f5f7] to-90%' : 'from-[#111]/0 via-[#111]/60 to-[#111] to-90%'}`}></div>
          <div className={`absolute -inset-4 bg-gradient-to-t ${isLight ? 'from-[#f4f5f7] from-10% via-[#f4f5f7]/0 to-[#f4f5f7] to-90%' : 'from-[#111] from-10% via-[#111]/0 to-[#111] to-90%'}`}></div>
        </>
      )}
    </div>
  );
}
