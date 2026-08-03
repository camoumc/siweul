import { Lock, Eye, KeyRound, UserCheck, MessageSquareWarning, FileWarning } from "lucide-react";

const POINTS = [
  {
    icon: Eye,
    title: "Vos coordonnees ne sont jamais publiques",
    text: "Votre numero de telephone n'apparait sur aucune annonce. Tous les echanges passent par la messagerie interne SIWEUL, et un filtre automatique masque tout numero qu'un utilisateur taperait dans un message.",
  },
  {
    icon: KeyRound,
    title: "Verification par detail cache",
    text: "Quand vous declarez un objet trouve, vous pouvez renseigner un detail que vous seul (et le vrai proprietaire) connaissez — une rayure, un autocollant, un contenu precis. Il ne sera jamais affiche publiquement et sert a confirmer l'identite avant la remise.",
  },
  {
    icon: Lock,
    title: "Mots de passe chiffres",
    text: "Vos mots de passe sont chiffres avec bcrypt (un algorithme de hachage a sens unique) : meme notre equipe ne peut pas les lire en clair.",
  },
  {
    icon: UserCheck,
    title: "Comptes et roles verifies",
    text: "Les comptes institutions (police, mairies, hopitaux...) sont verifies manuellement par notre equipe avant d'obtenir leur badge de confiance.",
  },
  {
    icon: MessageSquareWarning,
    title: "Signalement d'abus",
    text: "Tout comportement suspect ou signalement frauduleux peut etre signale a notre equipe de moderation, qui peut suspendre un compte en cas d'abus averé.",
  },
  {
    icon: FileWarning,
    title: "Donnees personnelles",
    text: "Vos informations (email, telephone, localisation) ne sont jamais vendues ni partagees a des tiers sans votre consentement explicite.",
  },
];

export default function SecuritePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal">Confiance</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-text">Sécurité & vérification</h1>
      <p className="mt-3 text-text-muted">
        Retrouver un objet ou une personne implique souvent des informations sensibles.
        Voici comment SIWEUL protege votre securite et votre vie privee a chaque etape.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title} className="rounded-3xl border border-border bg-white p-6">
            <p.icon className="text-signal" size={26} strokeWidth={1.5} />
            <h2 className="mt-3 font-display text-base font-semibold text-text">{p.title}</h2>
            <p className="mt-1 text-sm text-text-muted">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-alert/10 p-6 text-sm text-alert">
        <p className="font-semibold">En cas d&apos;urgence (danger immediat, personne disparue)</p>
        <p className="mt-1">
          SIWEUL est un outil communautaire, pas un service d&apos;urgence. Contactez d&apos;abord
          la Police (17) ou la Gendarmerie (800 00 20 20) avant de publier un signalement.
        </p>
      </div>
    </div>
  );
}
