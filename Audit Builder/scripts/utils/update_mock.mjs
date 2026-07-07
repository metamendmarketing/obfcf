import fs from 'fs';
let file = fs.readFileSync('C:\\Audit-Strategy-Template\\src\\lib\\mock-mcp.ts', 'utf-8');
const newSummary = `
  <p class="mb-6">MCP Funds occupies a critical space in the financial sector, yet our audit reveals a significant disconnect between your institutional credibility and your digital footprint. Currently, <strong>structural technical barriers are impeding search engines</strong> from indexing your most valuable content correctly, while performance friction on mobile devices threatens to erode user trust before a lead can even begin their inquiry.</p>
  
  <img src="/mcp-assets/mcp_page_10_img_2.png" class="w-full max-w-sm float-right ml-8 mb-6 border-4 border-white shadow-xl rounded" alt="Competitor Example" />

  <p class="mb-6">This audit categorizes the friction points holding you back, and the opportunities waiting to be claimed into <strong>3 distinct phases of the user journey</strong>:</p>

  <ul class="space-y-4 my-8 pl-4">
    <li class="flex gap-3"><span class="text-blue-600 font-bold">•</span> <div><strong>Awareness:</strong> Identifying the technical barriers - like missing rich results and inconsistent title - that render the brand invisible to high-intent searchers.</div></li>
    <li class="flex gap-3"><span class="text-blue-600 font-bold">•</span> <div><strong>Consideration:</strong> Highlighting where site performance, broken links, and confusing navigation erode the confidence of users who do arrive.</div></li>
    <li class="flex gap-3"><span class="text-blue-600 font-bold">•</span> <div><strong>Conversion:</strong> Friction points that slow action, along with opportunities to strengthen performance as search continues to evolve.</div></li>
  </ul>
  
  <p>By correcting these core architectural and performance issues, we can transform your website from a passive informational repository into a high-performance engine for lead generation and brand authority.</p>
`;
file = file.replace(/"executiveSummary": ".*?"/s, '"executiveSummary": `' + newSummary + '`');
fs.writeFileSync('C:\\Audit-Strategy-Template\\src\\lib\\mock-mcp.ts', file);
