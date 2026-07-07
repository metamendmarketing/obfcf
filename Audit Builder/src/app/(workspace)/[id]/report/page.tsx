"use client";

import { useStore } from "@/lib/store";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LivePreview } from "@/components/audit/LivePreview";
import { Loader2 } from "lucide-react";

export default function ReportExportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isHeadless = searchParams.get('headless') === 'true';
  const router = useRouter();
  const audit = useStore((state) => state.audits[id]);
  const [status, setStatus] = useState("Preparing document layout...");
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!audit || !audit.reportStructure) {
      if (!isHeadless) router.push(`/${id}/edit`);
      return;
    }

    if (started || isHeadless) return;
    setStarted(true);

    const generatePDF = async () => {
      try {
        setStatus("Spinning up PDF rendering engine...");
        setProgress(20);

        setStatus("Syncing latest changes to cloud...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        setStatus("Generating pixel-perfect native PDF...");
        setProgress(50);

        const response = await fetch('/audits/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auditId: id
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate PDF on server");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream returned");

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.error) {
                setStatus(`Error: ${data.error}`);
                return; // Abort processing
              }
              if (data.status) setStatus(data.status);
              if (data.progress !== undefined) setProgress(data.progress);
              
              if (data.pdfBase64) {
                setStatus("Downloading document...");
                
                // Decode base64 to binary ArrayBuffer
                const byteCharacters = atob(data.pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], {type: 'application/pdf'});
                
                // Trigger download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${audit.websiteUrl || 'Metamend'}_Audit_Report.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setProgress(100);
                setStatus("Complete! Redirecting...");
                
                setTimeout(() => {
                  router.push(`/${id}/edit`);
                }, 1500);
              }
            } catch (e: any) {
              if (e.message !== "Unexpected end of JSON input") {
                console.error("Parse error:", e);
              }
            }
          }
        }
      } catch (error: any) {
        console.error("PDF Generation failed:", error);
        setStatus(`Error: ${error.message || "Failed to generate PDF. Please try again."}`);
      }
    };

    generatePDF();
  }, [audit, id, router, started]);

  if (!audit) return null;

  const isError = status.startsWith("Error:");

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-6 max-w-xl w-full bg-[#0A0A0A] p-10 rounded-2xl border border-white/5 shadow-2xl">
        {isError ? (
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
        ) : (
          <Loader2 className="w-12 h-12 text-[#0057FF] animate-spin" />
        )}
        <h2 className="text-xl font-bold tracking-tight">
          {isError ? "PDF Generation Failed" : "Generating PDF"}
        </h2>
        
        {isError ? (
          <div className="w-full p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm font-mono text-left break-all whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {status}
          </div>
        ) : (
          <p className="text-white/60 text-sm text-center">{status}</p>
        )}
        
        {!isError && (
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0057FF] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Hidden LivePreview target for html-to-image */}
      <div className="absolute top-[20000px] left-[20000px] pointer-events-none">
        {/* We use a mask that acts as the "camera lens" */}
        <div id="capture-mask" style={{ width: '850px', height: '1100px', overflow: 'hidden', position: 'relative', backgroundColor: '#050505', fontSize: '16px' }}>
          {/* We slide this container around so the target frame is exactly under the lens */}
          <div id="capture-slider" style={{ position: 'absolute', top: 0, left: 0, transition: 'none' }}>
            <div id="live-preview-wrapper" className="w-fit" style={{ width: 'max-content' }}>
              <LivePreview audit={audit} activeSection="" activeFindingId={null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
