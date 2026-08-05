import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PaymentProvidersConfig from "@/components/admin/PaymentProvidersConfig";

export default function AdminPaymentProvidersPage() {
  return (
    <div>
      <Link href="/admin/paiements" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> Retour aux paiements
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold text-text">
        Configuration des moyens de paiement
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Activez Wave et Orange Money et renseignez vos clés API. Ces clés sont chiffrées
        avant d&apos;être stockées en base de données.
      </p>
      <PaymentProvidersConfig />
    </div>
  );
}
