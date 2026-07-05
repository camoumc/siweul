import AdminReportsTable from "@/components/admin/AdminReportsTable";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-text">Modération des signalements</h1>
      <p className="mt-1 mb-6 text-text-muted">Validez, résolvez ou supprimez les signalements publiés.</p>
      <AdminReportsTable />
    </div>
  );
}
