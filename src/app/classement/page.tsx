import { prisma } from "@/lib/prisma";
import { Trophy, Medal } from "lucide-react";

export default async function ClassementPage() {
  let topUsers: { id: string; name: string; points: number; city: string | null }[] = [];
  let topCities: { city: string; count: number }[] = [];

  try {
    topUsers = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 20,
      select: { id: true, name: true, points: true, city: true },
    });
    const grouped = await prisma.report.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 8,
    });
    topCities = grouped.map((g) => ({ city: g.city, count: g._count.city }));
  } catch {
    // base de données non connectée en environnement de build
  }

  const medalColor = ["text-gold", "text-text-muted", "text-signal-dark"];

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal">Gamification</p>
      <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-semibold text-text">
        <Trophy className="text-gold" /> Classement communautaire
      </h1>
      <p className="mt-2 text-text-muted">
        Chaque signalement publié ou résolu rapporte des points. Les membres les plus actifs font
        avancer toute la communauté SIWEUL.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-text">Top citoyens</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            {topUsers.length === 0 ? (
              <p className="p-6 text-center text-sm text-text-muted">Pas encore de classement.</p>
            ) : (
              topUsers.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-b border-border px-5 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold ${i < 3 ? medalColor[i] : "text-text-muted"}`}>
                      {i < 3 ? <Medal size={16} /> : i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text">{u.name}</p>
                      {u.city && <p className="text-xs text-text-muted">{u.city}</p>}
                    </div>
                  </div>
                  <span className="font-display font-semibold text-signal">{u.points} pts</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-text">Top villes</h2>
          <div className="space-y-2">
            {topCities.length === 0 ? (
              <p className="text-sm text-text-muted">Aucune donnée pour l&apos;instant.</p>
            ) : (
              topCities.map((c) => (
                <div key={c.city} className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-2.5 text-sm">
                  <span className="font-medium text-text">{c.city}</span>
                  <span className="text-text-muted">{c.count} signalements</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
