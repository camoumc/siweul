import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminReportEditForm from "@/components/admin/AdminReportEditForm";
import { ArrowLeft } from "lucide-react";

export default async function AdminEditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { photos: true, owner: { select: { email: true } } },
  });
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/signalements" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> Retour aux signalements
      </Link>
      <h1 className="mt-3 mb-6 font-display text-2xl font-semibold text-text">
        Modifier le signalement
      </h1>
      <AdminReportEditForm
        report={{
          ...report,
          eventDate: report.eventDate.toISOString(),
        }}
      />
    </div>
  );
}
