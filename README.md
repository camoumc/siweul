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
  Pagination par curseur (30 messages/page), separateurs de date, avatars, indicateurs
  de lecture (✓ / ✓✓) — pensee pour tenir avec des milliers de messages par conversation.
- **Mot de passe oublie / reinitialisation** par email (voir section 5quater), et
  changement de mot de passe + edition du profil depuis `/parametres`.
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
- **Programme Ambassadeurs** (`/ambassadeur`) : candidature, validation par l'admin,
  dashboard avec statistiques et historique des gains. Commission gagnée automatiquement
  à chaque signalement résolu publié ou aidé par l'ambassadeur. Classement dédié sur
  `/classement`. **Contrôle admin complet** (`/admin/ambassadeurs`) : approuver/rejeter/
  suspendre, filtrer/rechercher, modifier zone/ville/commission, ajuster manuellement les
  gains (bonus/correction), marquer les versements, supprimer un profil. Versements
  marqués manuellement par l'admin — pas de virement automatique (mêmes raisons de
  conformité que pour Wave/Orange Money).
- **Emails automatiques** pour les événements importants (validation ambassadeur,
  confirmation de paiement, versement effectué, mot de passe modifié) en plus des
  notifications in-app — voir section 5quater pour la configuration.
- **Moderation** (`/admin/moderation`) : signalement d'annonces frauduleuses par la
  communaute, traitement par l'admin.
- **Classement communautaire** (points, badges).
- **Notifications** : cloche legere (juste un compteur, poll toutes les 20s) + page
  complete paginee `/notifications` (marquer lu, supprimer, charger plus) — pensee pour
  tenir avec un historique volumineux sans ralentir la navigation.
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
> modèles (Organization, UserBadge, ReportFlag, PricingRule, Payment,
> PaymentProviderConfig, Ambassador, AmbassadorEarning, PasswordResetToken) et des index
> de performance sur Message/Notification. Après avoir remplacé vos fichiers, relancez
> `npx prisma db push` (en local ET pensez à le faire aussi contre votre base Neon de
> production) pour créer les nouvelles tables, puis `npm run db:seed` pour initialiser la
> grille tarifaire par défaut.
>
> Cette version corrige aussi un bug d'accès admin : le rôle utilisateur n'était pas
> toujours transmis correctement au middleware (pouvait bloquer l'accès à `/admin`), et
> le menu de navigation admin était invisible sur mobile. Un simple redéploiement suffit
> pour appliquer ces correctifs, sans étape supplémentaire.

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
- `ENCRYPTION_KEY` — obligatoire si vous configurez Wave et/ou Orange Money depuis
  l'admin (chiffre les clés API stockées en base). Générez-le avec
  `openssl rand -base64 32`, comme `NEXTAUTH_SECRET`. **Ne le changez jamais après coup**
  sans re-saisir les clés Wave/Orange Money, sinon elles deviennent illisibles.

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

## 5ter. Configurer Wave et Orange Money (depuis l'admin, pas de variable d'env)

Contrairement à Stripe, les clés Wave et Orange Money se saisissent directement dans
**`/admin/paiements/configuration`** — elles sont chiffrées (AES-256-GCM) avant d'être
stockées en base. Il vous faut uniquement `ENCRYPTION_KEY` en variable d'environnement
(voir section 5).

**Wave** :
1. Business Portal Wave > section *Developer* > créez une clé API et copiez-la
   (`wave_sn_prod_...`).
2. Toujours dans *Developer* > *Webhooks* : ajoutez l'URL
   `https://votre-domaine/api/webhooks/wave`, choisissez au moins l'événement
   `checkout.session.completed`, et copiez le secret de signature affiché.
3. Collez les deux valeurs dans `/admin/paiements/configuration`, cochez **Actif**,
   enregistrez.

**Orange Money** :
1. Créez un compte sur [developer.orange.com](https://developer.orange.com), créez une
   application Web Payment pour obtenir un `Client ID` / `Client Secret`.
2. Récupérez votre `Merchant Key` auprès de votre contrat marchand Orange Money Sénégal.
3. Renseignez ces 3 valeurs + le code pays (`sn`) dans `/admin/paiements/configuration`.
4. ⚠️ L'API Orange Money varie parfois selon le pays/contrat — testez un premier paiement
   en environnement de test avant la mise en production, et signalez-moi tout écart de
   comportement pour que j'ajuste `src/lib/orangeMoney.ts`.

**Important** : Wave et Orange Money ne gèrent pas les abonnements récurrents
automatiques comme Stripe — chaque paiement est un lien à usage unique. Le renouvellement
mensuel Premium/Pro nécessite pour l'instant que l'utilisateur repaie chaque mois (une
future amélioration pourra ajouter un rappel automatique).

---

## 5quater. Configurer l'envoi d'email (mot de passe oublié)

La réinitialisation de mot de passe nécessite un envoi d'email. Le projet utilise
[Resend](https://resend.com) (gratuit jusqu'à 3000 emails/mois) via un simple appel HTTP,
sans dépendance lourde.

1. Créez un compte sur [resend.com](https://resend.com), copiez votre clé API.
2. Ajoutez `RESEND_API_KEY` sur Vercel.
3. (Optionnel) `EMAIL_FROM` — l'adresse d'expédition. Par défaut :
   `SIWEUL <onboarding@resend.dev>` (fonctionne sans configuration DNS, mais moins
   professionnel). Pour utiliser `contact@siweul.pro`, ajoutez et vérifiez votre domaine
   dans Resend (Domains > Add Domain), puis mettez
   `EMAIL_FROM="SIWEUL <contact@siweul.pro>"`.

**Sans `RESEND_API_KEY` configuré**, le lien de réinitialisation est simplement
journalisé dans les logs Vercel (Functions > Logs) au lieu d'être envoyé par email — utile
pour tester sans compte Resend, mais **à configurer avant la mise en production**, sinon
vos utilisateurs ne pourront jamais réinitialiser leur mot de passe eux-mêmes.

## 5quinquies. Recommandations d'expert (non implémentées, pour la suite)

Quelques axes d'amélioration que je recommande, par ordre de priorité :

1. **Limitation de débit (rate limiting)** sur `/api/auth/forgot-password`,
   `/api/register` et la connexion — sans ça, un script peut spammer des emails de
   réinitialisation ou tenter des mots de passe en boucle. Solution simple : Vercel
   Firewall (gratuit, quelques clics) ou la librairie `@upstash/ratelimit`.
2. **Vérification d'email à l'inscription** : réutilise l'infrastructure Resend déjà en
   place, réduit les faux comptes.
3. **reCAPTCHA/hCaptcha** sur inscription et contact, pour limiter les faux comptes et le
   spam.
4. **Messagerie en temps réel** : le chat et les notifications utilisent aujourd'hui un
   "polling" (rafraîchissement périodique), simple et fiable à votre échelle actuelle.
   Si le volume de messages simultanés grossit beaucoup, un service comme Pusher ou Ably
   apporterait du temps réel instantané sans changer l'architecture existante.
5. **Compression des photos côté navigateur** avant upload (ex. `browser-image-compression`)
   pour réduire les coûts de stockage Vercel Blob et accélérer les publications.
6. **Journal d'audit admin** : historiser qui a changé quoi (rôle utilisateur, statut de
   signalement...) pour la traçabilité.
7. **Tests automatisés** (au moins sur le moteur de correspondance et les routes de
   paiement) avant toute évolution future du code, pour éviter les régressions.

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
