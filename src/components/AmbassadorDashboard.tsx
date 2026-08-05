import { Wallet, TrendingUp, Clock, Megaphone } from "lucide-react";

interface Earning {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface AmbassadorData {
  zone: string;
  city: string;
  commissionRate: number;
  totalEarned: number;
  totalPaidOut: number;
  approvedAt: string | null;
  earnings: Earning[];
}

export default function AmbassadorDashboard({ ambassador }: { ambassador: AmbassadorData }) {
  const pending = ambassador.totalEarned - ambassador.totalPaidOut;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
          <Megaphone size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Ambassadeur SIWEUL</h1>
          <p className="text-sm text-text-muted">{ambassador.zone}, {ambassador.city}</p>
        </div>
        <span className="ml-auto rounded-full bg-found/10 px-3 py-1 text-xs font-semibold text-found">
          Actif depuis {ambassador.approvedAt ? new Date(ambassador.approvedAt).toLocaleDateString("fr-FR") : "—"}
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <TrendingUp className="text-signal" size={20} />
          <p className="mt-2 font-display text-2xl font-semibold text-text">
            {ambassador.totalEarned.toLocaleString("fr-FR")} FCFA
          </p>
          <p className="text-xs text-text-muted">Total gagné</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <Clock className="text-gold" size={20} />
          <p className="mt-2 font-display text-2xl font-semibold text-text">
            {pending.toLocaleString("fr-FR")} FCFA
          </p>
          <p className="text-xs text-text-muted">En attente de versement</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <Wallet className="text-found" size={20} />
          <p className="mt-2 font-display text-2xl font-semibold text-text">
            {ambassador.totalPaidOut.toLocaleString("fr-FR")} FCFA
          </p>
          <p className="text-xs text-text-muted">Déjà versé</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Vous gagnez {ambassador.commissionRate.toLocaleString("fr-FR")} FCFA à chaque
        signalement résolu que vous avez publié ou aidé à résoudre. Les versements sont
        effectués manuellement par l&apos;équipe SIWEUL (Wave, Orange Money ou espèces).
      </p>

      <h2 className="mt-10 font-display text-lg font-semibold text-text">Historique des gains</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
        {ambassador.earnings.length === 0 ? (
          <p className="p-6 text-center text-sm text-text-muted">
            Aucun gain pour l&apos;instant. Publiez des objets trouvés et aidez la
            communauté pour commencer à gagner des commissions.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-paper-2 text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-2">Raison</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {ambassador.earnings.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text">{e.reason}</td>
                  <td className="px-4 py-3 font-medium text-text">{e.amount.toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        e.status === "VERSE" ? "bg-found/10 text-found" : "bg-gold/10 text-gold"
                      }`}
                    >
                      {e.status === "VERSE" ? "Versé" : "En attente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(e.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
