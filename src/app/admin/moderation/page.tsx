import FlagsTable from "@/components/admin/FlagsTable";

export default function AdminModerationPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Modération</h1>
      <p className="mt-1 text-sm text-text-muted">
        Annonces signalées comme frauduleuses ou abusives par la communauté. &laquo;
        Traiter &raquo; si vous avez pris une action (ex. suppression de l&apos;annonce
        depuis la page Signalements) ; &laquo; Rejeter &raquo; si l&apos;annonce est légitime.
      </p>
      <div className="mt-6">
        <FlagsTable />
      </div>
    </div>
  );
}
