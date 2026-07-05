import Link from "next/link";
import { MapPin, Calendar, Gift } from "lucide-react";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";

export interface ReportCardData {
  id: string;
  type: string;
  title: string;
  description: string;
  city: string;
  district?: string | null;
  eventDate: string | Date;
  reward?: number | null;
  photos: { url: string }[];
  status?: string;
}

export default function ReportCard({ report }: { report: ReportCardData }) {
  const cfg = REPORT_TYPES[report.type as ReportTypeKey];
  const photo = report.photos?.[0]?.url;

  return (
    <Link
      href={`/annonces/${report.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-paper-2">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={report.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <MapPin size={28} />
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold ${cfg.color}`}>
          {cfg.shortLabel}
        </span>
        {report.status === "RESOLU" && (
          <span className="absolute right-3 top-3 rounded-full bg-found px-2.5 py-1 text-xs font-bold text-white">
            Résolu
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold text-text line-clamp-1">{report.title}</h3>
        <p className="text-sm text-text-muted line-clamp-2">{report.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {report.district ? `${report.district}, ` : ""}{report.city}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {new Date(report.eventDate).toLocaleDateString("fr-FR")}
          </span>
        </div>
        {!!report.reward && (
          <span className="flex items-center gap-1 text-xs font-semibold text-gold">
            <Gift size={12} /> Récompense : {report.reward.toLocaleString("fr-FR")} FCFA
          </span>
        )}
      </div>
    </Link>
  );
}
