const fs = require('fs');
let c = fs.readFileSync('src/lib/templates/everest-final.ts', 'utf8');

c = c.replace(/"Needs Polish"/g, '"Polished"');
c = c.replace(/'Needs Polish'/g, '"Polished"');

// Add order: 0 to all findings
c = c.replace(/status: "Polished",/g, 'status: "Polished",\n    order: 0,');

// Add missing Audit fields
if (!c.includes('industry: "')) {
  c = c.replace(/status: "Approved",/, 'status: "Approved",\n  industry: "Digital Marketing",\n  primaryService: "SEO",\n  preparedBy: "Valtir",\n  date: new Date().toISOString(),');
}

fs.writeFileSync('src/lib/templates/everest-final.ts', c);
console.log("Patched everest-final.ts");
