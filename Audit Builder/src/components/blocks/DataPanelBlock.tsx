import React from "react";
import { useStore } from "@/lib/store";

export function DataPanelBlock({ audit: propAudit }: { audit?: any }) {
  const storeAudit = useStore(state => state.audits[state.activeAuditId!]);
  const audit = propAudit || storeAudit;
  
  if (!audit || !audit.reportStructure?.paidSearchData) return null;

  const data = audit.reportStructure.paidSearchData;

  return (
    <div className="w-[92%] mx-auto py-12 relative z-20 space-y-12 page-break-inside-avoid">
      {/* Competitors & Creative Section */}
      <div>
         <h3 className="text-2xl font-bold text-[#111] mb-6">Competitive Creative Analysis</h3>
         <div className="grid grid-cols-2 gap-8">
            {data.competitors?.map((comp: any, idx: number) => (
               <div key={idx} className="bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-800 text-sm tracking-wide uppercase">
                     {comp.name}
                  </div>
                  <div className="h-48 w-full bg-gray-200 relative">
                     {comp.imageUrl ? (
                        <img src={comp.imageUrl} alt={comp.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Creative Provided</div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-2 gap-8">
         <div className="bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 bg-[#111] text-white font-bold text-lg uppercase tracking-wide">{data.table1Title}</div>
            <table>
               <thead>
                  <tr>
                     <th>Keyword</th>
                     <th>Search Volume</th>
                     <th>CPC</th>
                  </tr>
               </thead>
               <tbody>
                  {data.table1Rows?.map((row: any, idx: number) => (
                     <tr key={idx}>
                        <td>{row.keyword}</td>
                        <td>{row.volume}</td>
                        <td>{row.cpc}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 bg-[#111] text-white font-bold text-lg uppercase tracking-wide">{data.table2Title}</div>
            <table>
               <thead>
                  <tr>
                     <th>Keyword</th>
                     <th>Search Volume</th>
                     <th>CPC</th>
                  </tr>
               </thead>
               <tbody>
                  {data.table2Rows?.map((row: any, idx: number) => (
                     <tr key={idx}>
                        <td>{row.keyword}</td>
                        <td>{row.volume}</td>
                        <td>{row.cpc}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
         <p className="text-gray-800 text-lg leading-relaxed italic border-l-4 border-[#0057FF] pl-4">
            {data.conclusionText}
         </p>
      </div>
    </div>
  );
}
