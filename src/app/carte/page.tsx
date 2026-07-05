"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { REPORT_TYPE_ORDER, REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";
import type { MapReport } from "@/components/ReportsMap";

const ReportsMap = dynamic(() => import("@/components/ReportsMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-2" />,
});

export default function CartePage() {
  const [type, setType] = useState("");
  const [reports, setReports] = useState<MapReport[]>([]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    setReports(data.items ?? []);
  }, [type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-white px-6 py-3">
        <button
          onClick={() => setType("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!type ? "bg-ink text-white" : "border border-border text-text-muted"}`}
        >
          Tout
        </button>
        {REPORT_TYPE_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${type === t ? "bg-ink text-white" : "border border-border text-text-muted"}`}
          >
            {REPORT_TYPES[t as ReportTypeKey].shortLabel}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-muted">{reports.length} résultat(s)</span>
      </div>
      <div className="flex-1">
        <ReportsMap reports={reports} />
      </div>
    </div>
  );
}
