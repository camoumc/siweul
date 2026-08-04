import PaymentsTable from "@/components/admin/PaymentsTable";

export default function AdminPaymentsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Paiements & revenus</h1>
      <p className="mt-1 text-sm text-text-muted">
        Historique des abonnements payés via Stripe.
      </p>
      <div className="mt-6">
        <PaymentsTable />
      </div>
    </div>
  );
}
