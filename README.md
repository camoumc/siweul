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
  points de gamification.
- **Classement communautaire** (points, badges).
- **Notifications** en application (cloche + centre de notifications).
- **Back-office admin** : statistiques (graphiques), gestion des utilisateurs (bannir,
  verifier, changer de role/plan), moderation des signalements.
- **Upload photo** via Vercel Blob (jusqu'a 6 photos par signalement).
- **Design "Wax & Indigo"** : identite visuelle originale (indigo nuit, orange signal,
  teal "trouve"), 100 % responsive.

### Non inclus dans cette V1 (voir section 6 "Prochaines etapes")
Envoi de SMS/WhatsApp/Telegram reels, publication automatique sur les reseaux sociaux,
application mobile Flutter, OTP/QR code de verification, 2FA — ces briques demandent des
comptes tiers payants (Twilio, Meta Business, etc.) et peuvent etre ajoutees ensuite.

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

> **Important** : `npx prisma generate` telecharge les moteurs Prisma depuis
> `binaries.prisma.sh`. Si vous developpez derriere un pare-feu/proxy restrictif, cette
> etape doit etre lancee sur une machine avec un acces internet complet (elle fonctionne
> normalement sur Vercel et sur la plupart des ordinateurs).

---

## 5. Variables d'environnement (`.env`)

Voir `.env.example`. Resume :

- `DATABASE_URL` — chaine de connexion PostgreSQL (Neon).
- `NEXTAUTH_SECRET` — secret de signature des sessions (`openssl rand -base64 32`).
- `NEXTAUTH_URL` — URL publique du site.
- `BLOB_READ_WRITE_TOKEN` — jeton Vercel Blob (Storage -> Blob -> onglet `.env.local`).

---

## 6. Prochaines etapes suggerees

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
