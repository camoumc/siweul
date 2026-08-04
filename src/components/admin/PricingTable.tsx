"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface PricingRule {
  id: string;
  key: string;
  label: string;
  category: string;
  amount: number;
  active: boolean;
}

export default function PricingTable() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setRules(await res.json());
      setLoading(false);
    };
    load();
  }, []);

  const update = (id: string, patch: Partial<PricingRule>) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const save = async (rule: PricingRule) => {
    setSavingId(rule.id);
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rule.id, amount: rule.amount, active: rule.active }),
    });
    setSavingId(null);
  };

  if (loading) return <p className="text-sm text-text-muted">Chargement...</p>;

  const categories = Array.from(new Set(rules.map((r) => r.category)));

  return (
    <div className="space-y-8">
      {rules.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-text-muted">
          Aucune grille tarifaire trouvée. Lancez <code>npm run db:seed</code> pour
          initialiser les tarifs par défaut, ou ajoutez des lignes directement via
          Prisma Studio.
        </p>
      )}
      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="font-display text-lg font-semibold text-text">{cat}</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-paper-2 text-left text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Élément</th>
                  <th className="px-4 py-2">Montant (FCFA)</th>
                  <th className="px-4 py-2">Actif</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rules.filter((r) => r.category === cat).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-2 font-medium text-text">{r.label}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={r.amount}
                        onChange={(e) => update(r.id, { amount: Number(e.target.value) })}
                        className="w-28 rounded-lg border border-border px-2 py-1 outline-none focus:border-signal"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={(e) => update(r.id, { active: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => save(r)}
                        disabled={savingId === r.id}
                        className="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {savingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Enregistrer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
