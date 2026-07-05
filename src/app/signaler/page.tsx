import Link from "next/link";
import { REPORT_TYPE_ORDER, REPORT_TYPES } from "@/lib/reportConfig";

const slugOf = (t: string) => t.toLowerCase().replace(/_/g, "-");

export default function SignalerIndex() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal">Nouveau signalement</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-text">
        Que souhaitez-vous signaler ?
      </h1>
      <p className="mt-3 max-w-xl text-text-muted">
        Choisissez la catégorie la plus adaptée : plus l&apos;information est précise, plus notre
        moteur de correspondance sera efficace.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPE_ORDER.map((type) => {
          const cfg = REPORT_TYPES[type];
          return (
            <Link
              key={type}
              href={`/signaler/${slugOf(type)}`}
              className={`rounded-3xl border border-border ${cfg.bg} p-6 transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className={`inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold ${cfg.color}`}>
                {cfg.shortLabel}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-text">{cfg.labelPlural}</h3>
              <p className="mt-2 text-sm text-text-muted">{cfg.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
