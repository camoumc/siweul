import Link from "next/link";
import { Building2, Landmark, Hospital, Plane, GraduationCap, ShieldCheck, Banknote, Users2 } from "lucide-react";

const PARTNERS = [
  { icon: ShieldCheck, name: "Commissariats & gendarmeries", text: "Publiez et cloturez des signalements de personnes disparues ou vehicules voles directement lies a vos dossiers." },
  { icon: Landmark, name: "Mairies", text: "Centralisez les objets/documents retrouves sur votre commune et orientez les administres vers SIWEUL." },
  { icon: Hospital, name: "Hopitaux", text: "Signalez rapidement les patients non identifies ou les effets personnels retrouves." },
  { icon: Plane, name: "Aeroports & gares", text: "Un canal unique pour les objets oublies par les voyageurs, relie a votre service objets trouves." },
  { icon: GraduationCap, name: "Ecoles & universites", text: "Un espace dedie pour les objets perdus sur le campus, gere par vos equipes de vie scolaire." },
  { icon: Banknote, name: "Assurances & banques", text: "Verifiez rapidement les declarations de perte/vol de vos clients (cartes, documents, vehicules)." },
];

export default function EntreprisesPage() {
  return (
    <div>
      <section className="bg-ink px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">Espace Institutions & Entreprises</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            Un reseau national, pas une application de plus
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            SIWEUL propose des comptes dedies aux institutions et entreprises pour publier,
            verifier et cloturer des signalements plus rapidement, avec une visibilite
            renforcee aupres de la communaute.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white hover:bg-signal-dark"
          >
            Demander un compte institution
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-text">
          Concu pour travailler avec
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p) => (
            <div key={p.name} className="rounded-3xl border border-border bg-white p-6">
              <p.icon className="text-signal" size={26} />
              <h3 className="mt-3 font-display text-base font-semibold text-text">{p.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-2 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-semibold text-text">Ce que vous obtenez</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6">
              <Building2 className="text-found" size={24} />
              <h3 className="mt-3 font-display text-base font-semibold text-text">Compte institution verifie</h3>
              <p className="mt-1 text-sm text-text-muted">
                Un badge de confiance sur vos signalements, visible par toute la communaute.
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6">
              <Users2 className="text-found" size={24} />
              <h3 className="mt-3 font-display text-base font-semibold text-text">Multi-utilisateurs</h3>
              <p className="mt-1 text-sm text-text-muted">
                Plusieurs membres de votre equipe peuvent gerer les signalements sous un
                meme compte institution (plan Pro).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
