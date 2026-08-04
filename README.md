# SIWEUL — Retrouver, ensemble

Plateforme communautaire pour objets perdus/trouves, personnes disparues, animaux perdus,
vehicules voles et documents administratifs, avec moteur IA de correspondance, carte
interactive, messagerie securisee, gamification et back-office admin complet.

---

## 1. Ce qui est inclus

- **6 modules** : objets perdus, objets trouves, personnes disparues, animaux perdus,
  vehicules voles, documents administratifs.
- **Moteur de correspondance IA** (deterministe et explicable) qui calcule un score de
  similarite (0-100 %) entre signalements et notifie automatiquement les deux parties
  au-dela de 55 % de correspondance.
- **Recherche & filtres** (ville, categorie, mot-cle) + **carte interactive** (Leaflet /
  OpenStreetMap, gratuite, sans cle API).
- **Messagerie interne securisee** : aucun numero de telephone n'est jamais affiche
  publiquement ; un filtre supprime automatiquement les numeros tapes dans le chat.
- **Comptes utilisateurs** avec roles (utilisateur, entreprise, police, gendarmerie,
  mairie, hopital, association, admin, super-admin), plans (gratuit/premium/pro),
  points de gamification, **badges** et **score de confiance**.
- **Espace Entreprise/Institution** (`/entreprise`) : creation d'organisation, gestion
  d'equipe, statistiques et liste des signalements publies au nom de l'organisation.
- **Paiement Stripe** (abonnements Premium/Pro) : `/admin/paiements` pour le suivi des
  revenus. Repli automatique sur demande manuelle si Stripe n'est pas configure.
- **Edition complete des annonces par l'admin** (`/admin/signalements/[id]`) : tous les
  champs modifiables, reassignation du proprietaire, gestion des photos.
- **3 langues en plus du francais** : anglais, espagnol, arabe (avec support RTL). Le
  selecteur est dans la navbar. *Traduit pour l'instant : accueil, connexion, inscription,
  navigation, pied de page — les autres pages restent en francais (voir section 6).*
- **Grille tarifaire admin** (`/admin/tarifs`) : prete pour la facturation a l'usage
  (recuperation d'objet), tarifs configurables par type d'objet/document.
- **Moderation** (`/admin/moderation`) : signalement d'annonces frauduleuses par la
  communaute, traitement par l'admin.
- **Classement communautaire** (points, badges).
- **Notifications** en application (cloche + centre de notifications).
- **Back-office admin** : statistiques (graphiques), gestion des utilisateurs (bannir,
  verifier, changer de role/plan), moderation des signalements.
- **Upload photo** via Vercel Blob (jusqu'a 6 photos par signalement).
- **Design "Wax & Indigo"** : identite visuelle originale (indigo nuit, orange signal,
  teal "trouve"), 100 % responsive.

### Non inclus dans cette V1 (voir section 6 "Prochaines etapes")
Paiement reel (Stripe/Wave/Orange Money), frais de recuperation d'objet factures,
recompenses financieres avec commission SIWEUL, programme Ambassadeurs, reconnaissance
d'image par IA, verification d'identite formelle, envoi de SMS/WhatsApp/Telegram reels,
publication automatique sur les reseaux sociaux, application mobile Flutter.

---

## 2. Stack technique

| Brique          | Choix                                    |
|-----------------|-------------------------------------------|
| Framework       | Next.js 16 (App Router) + TypeScript        |
| Style           | Tailwind CSS v4                            |
| Base de donnees | PostgreSQL (Neon — gratuit)                |
| ORM             | Prisma 6                                   |
| Authentification| NextAuth v5 (JWT, Credentials + bcrypt)    |
| Stockage photos | Vercel Blob (gratuit)                      |
| Carte           | Leaflet / React-Leaflet (OpenStreetMap)    |
| Graphiques      | Recharts                                   |
| Hebergement     | Vercel (gratuit)                           |

---

## 3. Deploiement en 10 minutes (Vercel + Neon)

### Etape 1 — Mettre le code sur GitHub
```bash
cd siweul
git init
git add .
git commit -m "SIWEUL v1"
```
Creez un depot sur github.com/new, puis :
```bash
git remote add origin https://github.com/VOTRE-COMPTE/siweul.git
git push -u origin main
```

### Etape 2 — Creer la base de donnees (Neon, gratuit)
1. Allez sur neon.tech -> creez un compte -> **New Project**.
2. Copiez la **Connection string** (commence par `postgresql://...?sslmode=require`).

### Etape 3 — Deployer sur Vercel
1. Allez sur vercel.com/new -> **Import** votre depot GitHub.
2. Dans **Environment Variables**, ajoutez :

   | Nom | Valeur |
   |---|---|
   | `DATABASE_URL` | la chaine de connexion Neon de l'etape 2 |
   | `NEXTAUTH_SECRET` | generez-la avec `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://votre-projet.vercel.app` (a mettre a jour apres le premier deploiement) |
   | `BLOB_READ_WRITE_TOKEN` | voir etape 4 |

3. Cliquez sur **Deploy**.

### Etape 4 — Activer le stockage photo (Vercel Blob, gratuit)
1. Dans votre projet Vercel -> onglet **Storage** -> **Create Database** -> **Blob**.
2. Le token `BLOB_READ_WRITE_TOKEN` est injecte automatiquement dans vos variables
   d'environnement. Redeployez si besoin (**Deployments** -> ... -> **Redeploy**).

### Etape 5 — Creer les tables et le premier compte admin
Depuis votre machine, avec le `DATABASE_URL` de Neon dans `.env` :
```bash
npm install
npx prisma db push        # cree toutes les tables dans Neon
ADMIN_EMAIL=vous@exemple.com ADMIN_PASSWORD=UnMotDePasseSolide! npm run db:seed
```
Vous pouvez maintenant vous connecter sur `/connexion` avec ce compte, puis acceder a
`/admin`.

C'est tout — SIWEUL est en ligne, gratuitement, avec une base de donnees de production.

---

## 4. Developpement local

```bash
npm install
cp .env.example .env      # puis renseignez DATABASE_URL, NEXTAUTH_SECRET, etc.
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
Ouvrez http://localhost:3000.

> **Mise à jour depuis une version précédente** : cette version ajoute de nouveaux
> modèles (Organization, UserBadge, ReportFlag, PricingRule, Payment). Après avoir
> remplacé vos fichiers, relancez `npx prisma db push` (en local ET pensez à le faire
> aussi contre votre base Neon de production) pour créer les nouvelles tables, puis
> `npm run db:seed` pour initialiser la grille tarifaire par défaut.

> **Important** : `npx prisma generate` telecharge les moteurs Prisma depuis
> `binaries.prisma.sh`. Si vous developpez derriere un pare-feu/proxy restrictif, cette
> etape doit etre lancee sur une machine avec un acces internet complet (elle fonctionne
> normalement sur Vercel et sur la plupart des ordinateurs).

---

## 5. Variables d'environnement (`.env`)

Voir `.env.example`. Resume :

- `DATABASE_URL` — chaine de connexion PostgreSQL (Neon).
- `NEXTAUTH_SECRET` / `AUTH_SECRET` — meme valeur, secret de signature des sessions
  (`openssl rand -base64 32`). Les deux noms sont acceptes.
- `NEXTAUTH_URL` — URL publique du site.
- `BLOB_READ_WRITE_TOKEN` — jeton Vercel Blob (Storage -> Blob -> onglet `.env.local`).
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PRO`
  — facultatifs, voir section 5bis.

## 5bis. Configurer les paiements Stripe (facultatif)

Le site fonctionne parfaitement sans Stripe configure : le bouton "Passer Premium"
retombe automatiquement sur une demande manuelle traitee par un admin. Pour activer les
vrais paiements :

1. Creez un compte sur [dashboard.stripe.com](https://dashboard.stripe.com).
   ⚠️ Stripe ne permet pas la creation directe d'un compte pour une entreprise
   enregistree au Senegal a l'heure actuelle. Vous aurez besoin d'une entite eligible
   (ex. societe US) ou d'envisager une alternative comme Flutterwave/Paystack (qui
   operent nativement en Afrique de l'Ouest) — l'integration technique suit le meme
   principe (session de paiement + webhook), n'hesitez pas a demander l'adaptation.
2. Dans Stripe : **Produits** -> creez "SIWEUL Premium" et "SIWEUL Pro" avec un prix
   recurrent mensuel dans la devise de votre choix. Copiez chaque **Price ID**
   (`price_...`) dans `STRIPE_PRICE_PREMIUM` / `STRIPE_PRICE_PRO`.
3. Dans **Developpeurs > Cles API** : copiez la cle secrete dans `STRIPE_SECRET_KEY`.
4. Dans **Developpeurs > Webhooks** : ajoutez un endpoint
   `https://votre-domaine/api/webhooks/stripe`, ecoutez au minimum les evenements
   `checkout.session.completed` et `customer.subscription.deleted`, puis copiez le
   secret de signature dans `STRIPE_WEBHOOK_SECRET`.
5. Ajoutez ces 4 variables sur Vercel (Settings > Environment Variables) et redeployez.

---

## 6. Prochaines etapes suggerees

0. **Traduction complete** : l'infrastructure EN/ES/AR est en place
   (`src/i18n/`) mais seules les pages accueil/connexion/inscription + navigation/pied de
   page sont traduites. Pour traduire une page existante : ajoutez ses textes dans les 4
   fichiers `src/i18n/dictionaries/{fr,en,es,ar}.ts`, puis remplacez le texte en dur par
   `dict.xxx` (via `useLocale()` dans un composant client, ou `getServerDictionary()`
   dans un composant serveur).

1. **Notifications SMS/WhatsApp** : brancher un fournisseur (Twilio, Infobip, WhatsApp
   Cloud API) dans `src/lib/runMatching.ts` et `src/app/api/conversations/[id]/messages/route.ts`.
2. **Partage reseaux sociaux automatique** : ajouter les SDK Meta/X lors de la creation
   d'un signalement.
3. **Verification renforcee** : OTP par SMS et QR code a la remise de l'objet (le champ
   `hiddenDetail` pose deja les bases d'une verification par question secrete).
4. **Application mobile** : reutiliser les API REST existantes (`/api/reports`,
   `/api/conversations`, etc.) depuis une app Flutter ou React Native.
5. **Comptes institutionnels** (police, mairies...) : les roles existent deja en base
   (`Role` dans `prisma/schema.prisma`) ; il reste a construire des vues dediees par role.

---

## 7. Structure du projet

```
src/
  app/                 # Pages (App Router) + routes API
    admin/             # Back-office (protege par middleware)
    api/               # Endpoints REST
    signaler/[type]/   # Formulaire dynamique par module
    annonces/[id]/     # Detail d'un signalement
    rechercher/        # Recherche + filtres
    carte/             # Carte interactive
    tableau-de-bord/   # Espace utilisateur
    messagerie/[id]/   # Messagerie
  components/          # Composants React reutilisables
  lib/                 # Prisma, auth, config des modules, moteur de matching
  auth.ts              # Config NextAuth complete (Node)
  auth.config.ts       # Config NextAuth "Edge-safe" (middleware)
prisma/
  schema.prisma        # Modele de donnees complet
  seed.ts              # Creation du premier compte admin
```
