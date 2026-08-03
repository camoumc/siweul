import PlanCard from "@/components/PlanCard";
import { ShieldCheck, Zap, HeadphonesIcon, Sparkles } from "lucide-react";

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal">Abonnements</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-text">
          Retrouvez plus vite avec SIWEUL Premium
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-text-muted">
          SIWEUL reste gratuit pour l&apos;essentiel. Les plans payants financent
          l&apos;amelioration continue de la plateforme et donnent un acces prioritaire
          aux fonctionnalites avancees.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <PlanCard
          plan="PREMIUM"
          name="Gratuit"
          price="0 FCFA"
          isFree
          features={[
            "Signalements illimites (6 modules)",
            "Recherche et carte interactive",
            "Messagerie securisee",
            "Moteur de correspondance IA",
            "Notifications en application",
          ]}
        />
        <PlanCard
          plan="PREMIUM"
          name="Premium"
          price="2 000 FCFA"
          period="mois"
          highlighted
          features={[
            "Tout le plan Gratuit",
            "Signalements mis en avant (priorite d'affichage)",
            "Alertes SMS/WhatsApp en plus des notifications in-app *",
            "Support client prioritaire",
            "Badge Premium sur votre profil",
          ]}
        />
        <PlanCard
          plan="PRO"
          name="Pro (Entreprises)"
          price="Sur devis"
          features={[
            "Tout le plan Premium",
            "Comptes multi-utilisateurs (equipe)",
            "Tableau de bord statistiques dedie",
            "Acces API pour integrer SIWEUL a vos outils",
            "Accompagnement a la mise en place",
          ]}
        />
      </div>
      <p className="mt-4 text-center text-xs text-text-muted">
        * Les canaux SMS/WhatsApp sont en cours d&apos;activation ; en attendant, toutes les
        alertes Premium sont delivrees en priorite dans votre centre de notifications.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Zap, title: "Mise en avant", text: "Vos signalements apparaissent en tete des resultats de recherche." },
          { icon: ShieldCheck, title: "Verification prioritaire", text: "Vos demandes de verification sont traitees en premier par nos moderateurs." },
          { icon: HeadphonesIcon, title: "Support prioritaire", text: "Une reponse sous 24h a toute question via la messagerie SIWEUL." },
          { icon: Sparkles, title: "Nouveautes en avant-premiere", text: "Testez les nouvelles fonctionnalites avant tout le monde." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-paper-2 p-6">
            <f.icon className="text-signal" size={24} />
            <h3 className="mt-3 font-display text-base font-semibold text-text">{f.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-ink px-8 py-10 text-center text-white">
        <h2 className="font-display text-2xl font-semibold">Besoin d&apos;un plan Entreprise sur mesure ?</h2>
        <p className="mx-auto mt-2 max-w-lg text-white/70">
          Commissariats, mairies, hopitaux, assurances : contactez-nous pour une offre
          adaptee a votre organisation.
        </p>
        <a
          href="/contact"
          className="mt-6 inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white hover:bg-signal-dark"
        >
          Nous contacter
        </a>
      </div>
    </div>
  );
}
