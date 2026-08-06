import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminAmbassadorDetail from "@/components/admin/AdminAmbassadorDetail";

export default async function AdminAmbassadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Link href="/admin/ambassadeurs" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> Retour aux ambassadeurs
      </Link>
      <h1 className="mt-3 mb-6 font-display text-2xl font-semibold text-text">
        Gérer cet ambassadeur
      </h1>
      <AdminAmbassadorDetail ambassadorId={id} />
    </div>
  );
}
