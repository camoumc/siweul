import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-text">Gestion des utilisateurs</h1>
      <p className="mt-1 mb-6 text-text-muted">Rôles, vérification, bannissement.</p>
      <AdminUsersTable />
    </div>
  );
}
