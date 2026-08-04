import Link from "next/link";
import { PlusCircle } from "lucide-react";
import AdminReportsTable from "@/components/admin/AdminReportsTable";

export default function AdminReportsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">Modération des signalements</h1>
          <p className="mt-1 text-text-muted">Validez, résolvez, modifiez ou supprimez les signalements publiés.</p>
        </div>
        <Link
          href="/admin/signalements/nouveau"
          className="flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-signal-dark"
        >
          <PlusCircle size={16} /> Ajouter un signalement
        </Link>
      </div>
      <div className="mt-6">
        <AdminReportsTable />
      </div>
    </div>
  );
}
