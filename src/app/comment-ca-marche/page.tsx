import Link from "next/link";
import { Search, Sparkles, ShieldCheck, MessageCircle, MapPin, Trophy } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "1. Decrivez ce que vous cherchez",
    text: "Choisissez le module adapte (objet, personne, animal, vehicule, document), puis remplissez le formulaire : photos, couleur, marque, lieu, date. Plus c'est precis, plus vite l'IA trouvera une correspondance.",
  },
  {
    icon: Sparkles,
    title: "2. Notre IA compare en continu",
    text: "Des qu'un nouveau signalement est publie, il est automatiquement compare a tous les signalements actifs du type oppose (perdu / trouve) dans la meme zone et periode. Un score de similarite de 0 a 100% est calcule.",
  },
  {
    icon: MapPin,
    title: "3. Vous recevez une alerte",
    text: "Des qu'une correspondance depasse 55%, les deux parties recoivent une notification avec un lien vers l'annonce correspondante.",
  },
  {
    icon: MessageCircle,
    title: "4. Vous echangez en toute securite",
    text: "Toute la discussion se fait dans la messagerie interne SIWEUL. Aucun numero de telephone n'est jamais affiche publiquement ; un filtre le masque automatiquement si quelqu'un le tape par erreur.",
  },
  {
    icon: ShieldCheck,
    title: "5. Vous verifiez avant de remettre l'objet",
    text: "La personne qui a trouve l'objet peut renseigner un detail cache (connu seulement du vrai proprietaire) pour confirmer l'identite avant la remise.",
  },
  {
    icon: Trophy,
    title: "6. Vous gagnez des points",
    text: "Chaque signalement publie rapporte des points communautaires, visibles dans le classement. Plus vous aidez la communaute, plus votre profil grandit.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal">Guide</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-text">Comment ça marche</h1>
      <p className="mt-3 text-text-muted">
        SIWEUL combine signalement communautaire et intelligence artificielle pour
        reconnecter plus vite les objets, animaux, vehicules et documents perdus a leurs
        proprietaires — et aider a retrouver les personnes disparues.
      </p>

      <div className="mt-10 space-y-6">
        {STEPS.map((s) => (
          <div key={s.title} className="flex gap-4 rounded-3xl border border-border bg-white p-6">
            <s.icon className="mt-1 shrink-0 text-signal" size={28} strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-lg font-semibold text-text">{s.title}</h2>
              <p className="mt-1 text-sm text-text-muted">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-paper-2 p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-text">Prêt à commencer ?</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/signaler" className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white hover:bg-signal-dark">
            Faire un signalement
          </Link>
          <Link href="/rechercher" className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-text hover:bg-paper-2">
            Parcourir les annonces
          </Link>
        </div>
      </div>
    </div>
  );
}
