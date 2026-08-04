import PricingTable from "@/components/admin/PricingTable";

export default function AdminTarifsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Grille tarifaire</h1>
      <p className="mt-1 text-sm text-text-muted">
        Ces montants sont préparés pour la Phase 3 (paiement Wave / Orange Money / carte).
        Aucun paiement réel n&apos;est encore débité — cette page configure les tarifs qui
        seront utilisés une fois les moyens de paiement activés.
      </p>
      <div className="mt-6">
        <PricingTable />
      </div>
    </div>
  );
}
