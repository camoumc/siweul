import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { REPORT_TYPE_ORDER, REPORT_TYPES } from "@/lib/reportConfig";
import { Search, ShieldCheck, Users2, MapPinned, Sparkles } from "lucide-react";
import { getServerDictionary } from "@/i18n/server";

async function getHomeStats() {
  try {
    const [total, resolved, users] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: "RESOLU" } }),
      prisma.user.count(),
    ]);
    return { total, resolved, users };
  } catch {
    return { total: 0, resolved: 0, users: 0 };
  }
}

export default async function Home() {
  const [stats, { dict }] = await Promise.all([getHomeStats(), getServerDictionary()]);
  const h = dict.home;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70">
              <Sparkles size={14} className="text-gold" />
              {h.badge}
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {h.titleLine1}
              <br />
              <span className="italic text-signal">{h.titleLine2}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">{h.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signaler"
                className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-signal/20 hover:bg-signal-dark"
              >
                {h.ctaReport}
              </Link>
              <Link
                href="/rechercher"
                className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Search size={16} /> {h.ctaBrowse}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-white/60">
              <div>
                <p className="font-display text-2xl font-semibold text-white">{stats.total}+</p>
                <p>{h.statsPublished}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-white">{stats.resolved}</p>
                <p>{h.statsResolved}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-white">{stats.users}+</p>
                <p>{h.statsUsers}</p>
              </div>
            </div>
          </div>

          {/* Signature visuelle : radar de localisation */}
          <div className="relative mx-auto flex h-80 w-80 items-center justify-center lg:h-96 lg:w-96">
            <span className="absolute h-full w-full rounded-full border border-signal/30 siweul-radar-ring" />
            <span className="absolute h-full w-full rounded-full border border-signal/30 siweul-radar-ring [animation-delay:0.9s]" />
            <span className="absolute h-full w-full rounded-full border border-signal/30 siweul-radar-ring [animation-delay:1.8s]" />
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white ring-8 ring-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-icon.png" alt="SIWEUL" className="h-28 w-28" />
            </div>
            <div className="absolute left-8 top-10 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-xl">
              iPhone noir &middot; <span className="text-found">96% match</span>
            </div>
            <div className="absolute bottom-8 right-4 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-ink shadow-xl">
              Chat tigre &middot; Ngor
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-signal">{h.modulesEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-text">{h.modulesTitle}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPE_ORDER.map((type) => {
            const cfg = REPORT_TYPES[type];
            return (
              <Link
                key={type}
                href={`/signaler/${type.toLowerCase().replace(/_/g, "-")}`}
                className={`group rounded-3xl border border-border ${cfg.bg} p-6 transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <span className={`inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold ${cfg.color}`}>
                  {cfg.shortLabel}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-text">
                  {cfg.labelPlural}
                </h3>
                <p className="mt-2 text-sm text-text-muted">{cfg.description}</p>
                <span className={`mt-4 inline-block text-sm font-semibold ${cfg.color}`}>
                  {h.reportCta} &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="bg-paper-2 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-signal">{h.howEyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-text">{h.howTitle}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", title: h.step1Title, text: h.step1Text, icon: Search },
              { n: "02", title: h.step2Title, text: h.step2Text, icon: Sparkles },
              { n: "03", title: h.step3Title, text: h.step3Text, icon: ShieldCheck },
            ].map((s) => (
              <div key={s.n} className="rounded-3xl bg-white p-8 shadow-sm">
                <span className="font-mono text-xs text-text-muted">{s.n}</span>
                <s.icon className="mt-3 text-signal" size={28} strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-lg font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEAU */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 rounded-3xl bg-ink px-8 py-14 text-white md:grid-cols-2 md:px-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">{h.networkEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{h.networkTitle}</h2>
            <p className="mt-4 text-white/70">{h.networkText}</p>
            <Link
              href="/entreprises"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              <Users2 size={16} /> {h.networkCta}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
            {["Commissariats", "Gendarmeries", "Mairies", "Hopitaux", "Aeroports & gares", "Hotels", "Ecoles & universites", "Assurances & banques"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                  <MapPinned size={16} className="text-signal" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
