"use client";

import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { LivePreview } from "@/components/audit/LivePreview";
import { useEffect, useState } from "react";

export default function PrintAuditPage() {
  const params = useParams();
  const id = params.id as string;
  const audit = useStore((state) => state.audits[id]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !audit) return null;

  return (
    <div className="w-fit bg-[#0B0B0C] min-h-screen text-white overflow-hidden">
      <div id="capture-slider" className="transition-none w-fit" style={{ transform: 'translateX(0px)' }}>
        <LivePreview audit={audit} activeSection="" activeFindingId={null} />
      </div>
    </div>
  );
}
