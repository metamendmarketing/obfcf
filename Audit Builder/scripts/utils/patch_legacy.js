const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'audit', 'LegacySections.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Z-index fix for InteractiveWrapper
content = content.replace(/hover:z-20/g, 'hover:z-[999]');

// 2. Remove max-h-[450px] and max-h-[350px] from images
content = content.replace(/max-h-\[450px\] /g, '');
content = content.replace(/max-h-\[350px\] /g, '');

// 3. Flatten the DOM structure for optional nodes (remove the isolating wrappers)
content = content.replace(
  /<div className="absolute inset-0 pointer-events-none z-20">\s*<InteractiveWrapper\s+([\s\S]*?)className="([\s\S]*?)"\s+style=\{([\s\S]*?)\}\s*>([\s\S]*?)<\/InteractiveWrapper>\s*<\/div>/g,
  (match, p1, p2, p3, p4) => {
    return `<InteractiveWrapper ${p1}className="col-start-1 row-start-1 ${p2}" style={{ ...${p3}, zIndex: 20 }}>${p4}</InteractiveWrapper>`;
  }
);

content = content.replace(
  /<div className="absolute inset-0 pointer-events-none z-30">\s*<InteractiveWrapper\s+([\s\S]*?)className="([\s\S]*?)"\s+style=\{([\s\S]*?)\}\s*>([\s\S]*?)<\/InteractiveWrapper>\s*<\/div>/g,
  (match, p1, p2, p3, p4) => {
    return `<InteractiveWrapper ${p1}className="col-start-1 row-start-1 ${p2}" style={{ ...${p3}, zIndex: 30 }}>${p4}</InteractiveWrapper>`;
  }
);

// 4. Calculate requiredMarginTop and apply to the grid layouts
const bleedLogic = `
            const bleedOffsets = [
              actualVerticalOffset || 0,
              imgVerticalOffset || 0,
              img2VerticalOffset || 0,
              finding.showBusinessImpact ? (finding.businessImpactVerticalOffset ?? 100) : 0,
              finding.showRecommendation ? (finding.recommendationVerticalOffset ?? 200) : 0,
              finding.showTable ? (finding.tableVerticalOffset ?? 300) : 0
            ];
            const requiredMarginTop = Math.abs(Math.min(0, ...bleedOffsets));
            const gridStyle = { marginTop: \`\${requiredMarginTop}px\` };
`;

// Insert the bleed logic before `let layoutContent = null;`
content = content.replace(
  /(\/\/ Layout Engine\s*let layoutContent = null;)/,
  bleedLogic + '\n            $1'
);

// Apply gridStyle to all the grid containers inside the Layout Engine
content = content.replace(
  /<div className="grid grid-cols-1 relative w-full items-start">/g,
  `<div className="grid grid-cols-1 relative w-full items-start" style={gridStyle}>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched LegacySections.tsx successfully');
