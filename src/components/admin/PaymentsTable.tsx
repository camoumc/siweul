"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  plan: string | null;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setTotals(data.totalByCurrency);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-sm text-text-muted">Chargement...</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        {Object.entries(totals).length === 0 && (
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-sm text-text-muted">Aucun revenu enregistré pour l&apos;instant.</p>
          </div>
        )}
        {Object.entries(totals).map(([currency, amount]) => (
          <div key={currency} className="rounded-2xl border border-border bg-white p-5">
            <CreditCard className="text-found" size={20} />
            <p className="mt-2 font-display text-2xl font-semibold text-text">
              {(amount / 100).toLocaleString("fr-FR")} {currency.toUpperCase()}
            </p>
            <p className="text-xs text-text-muted">Revenu total encaissé</p>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
          Aucun paiement pour l&apos;instant. Ils apparaîtront ici dès que Stripe sera
          configuré et qu&apos;un premier abonnement sera payé.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{p.user.name}</p>
                    <p className="text-xs text-text-muted">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text">{p.plan ?? "—"}</td>
                  <td className="px-4 py-3 text-text">
                    {(p.amount / 100).toLocaleString("fr-FR")} {p.currency.toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-found/10 px-2.5 py-1 text-xs font-semibold text-found">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
