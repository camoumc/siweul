import Link from "next/link";
import { Settings } from "lucide-react";
import PaymentsTable from "@/components/admin/PaymentsTable";

export default function AdminPaymentsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Paiements & revenus</h1>
          <p className="mt-1 text-sm text-text-muted">
            Historique des abonnements payés via Stripe, Wave et Orange Money.
          </p>
        </div>
        <Link
          href="/admin/paiements/configuration"
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2"
        >
          <Settings size={15} /> Configurer Wave / Orange Money
        </Link>
      </div>
      <div className="mt-6">
        <PaymentsTable />
      </div>
    </div>
  );
}
