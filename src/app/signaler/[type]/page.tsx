import { notFound } from "next/navigation";
import ReportForm from "@/components/ReportForm";
import { REPORT_TYPE_ORDER, type ReportTypeKey } from "@/lib/reportConfig";

const slugToType: Record<string, ReportTypeKey> = Object.fromEntries(
  REPORT_TYPE_ORDER.map((t) => [t.toLowerCase().replace(/_/g, "-"), t])
) as Record<string, ReportTypeKey>;

export function generateStaticParams() {
  return Object.keys(slugToType).map((type) => ({ type }));
}

export default async function SignalerTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const reportType = slugToType[type];
  if (!reportType) notFound();

  return <ReportForm type={reportType} />;
}
