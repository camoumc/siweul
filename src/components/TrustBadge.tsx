import { trustScoreLabel } from "@/lib/trustScore";
import { ShieldCheck } from "lucide-react";

export default function TrustBadge({ score, isVerified }: { score: number; isVerified: boolean }) {
  const color =
    score >= 85 ? "text-found" : score >= 65 ? "text-signal" : score >= 40 ? "text-gold" : "text-text-muted";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
          <div
            className={`h-full rounded-full ${score >= 65 ? "bg-found" : score >= 40 ? "bg-gold" : "bg-border"}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className={`shrink-0 text-xs font-semibold ${color}`}>
        {trustScoreLabel(score)} ({score}/100)
      </span>
      {isVerified && <ShieldCheck size={14} className="shrink-0 text-found" />}
    </div>
  );
}
