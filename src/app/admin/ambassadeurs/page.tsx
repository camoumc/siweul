import AdminAmbassadorsTable from "@/components/admin/AdminAmbassadorsTable";

export default function AdminAmbassadorsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Programme Ambassadeurs</h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Approuvez les candidatures, suivez les commissions et marquez les versements
        effectués manuellement (Wave, Orange Money, espèces).
      </p>
      <AdminAmbassadorsTable />
    </div>
  );
}
