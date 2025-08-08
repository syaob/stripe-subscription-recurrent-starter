# Stripe Subscription Starter - Guide de l'Étudiant

Ce projet est une application Next.js conçue pour démontrer un flux d'abonnement Stripe de base, incluant l'authentification utilisateur, la gestion des abonnements et la gestion des webhooks.

## Caractéristiques du Projet

*   **Framework :** Next.js (React)
*   **Authentification :** NextAuth.js (Fournisseur d'identifiants)
*   **Base de données :** Prisma (ORM) avec SQLite (pour le développement, facilement adaptable)
*   **Passerelle de paiement :** Stripe (Sessions de paiement, Webhooks, API d'abonnements)
*   **Styling :** Tailwind CSS (via `globals.css`)
*   **Langage :** TypeScript

## Fonctionnalités Clés

*   **Authentification Utilisateur :**
    *   Inscription avec email et mot de passe.
    *   Connexion avec email et mot de passe.
*   **Gestion des Abonnements :**
    *   Affichage des plans d'abonnement disponibles.
    *   Permet aux utilisateurs de s'abonner à un plan via Stripe Checkout.
    *   Affichage du plan d'abonnement actuel de l'utilisateur (le cas échéant).
    *   Permet aux utilisateurs de mettre à niveau leur abonnement vers un niveau supérieur.
    *   Tableau de bord client pour visualiser et gérer les abonnements actifs.
    *   Option d'annuler un abonnement actif depuis le tableau de bord client.
*   **Intégration Stripe :**
    *   Création de sessions de paiement Stripe pour les nouveaux abonnements.
    *   Gestion des webhooks Stripe pour les événements `checkout.session.completed`, `invoice.payment_succeeded` et `customer.subscription.deleted` pour mettre à jour les enregistrements de la base de données.
    *   Récupération du statut d'abonnement en temps réel depuis Stripe.
*   **Intégration de la Base de Données :**
    *   Schéma Prisma pour les modèles `User` et `Subscription`.
    *   Migrations de base de données gérées par Prisma.
    *   Stocke `stripeCustomerId`, `stripePriceId` et `stripeSubscriptionId` pour les utilisateurs.
*   **Gestion de Session :**
    *   Session NextAuth.js mise à jour dynamiquement après les modifications d'abonnement (via webhooks et rafraîchissement de session côté client).

## Configuration et Reproduction Locale

Suivez ces étapes pour faire fonctionner le projet sur votre machine locale.

### Prérequis

*   Node.js (v18 ou supérieur recommandé)
*   npm ou yarn
*   Git
*   Un compte Stripe (pour les clés API et la configuration des webhooks)

### 1. Cloner le Dépôt

```bash
git clone <url_du_depot>
cd stripe-subscription-starter
```

### 2. Installer les Dépendances

```bash
npm install
# ou
yarn install
```

### 3. Variables d'Environnement

Créez un fichier `.env.local` à la racine de votre projet et ajoutez les variables d'environnement suivantes. Remplacez les valeurs de remplacement par vos clés et URL réelles.

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="VOTRE_SECRET_NEXTAUTH" # Générer une chaîne aléatoire forte
NEXTAUTH_URL="http://localhost:3000" # L'URL de votre application

STRIPE_SECRET_KEY="sk_test_VOTRE_CLE_SECRETE_STRIPE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIABLE_STRIPE"
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_SECRET_WEBHOOK_STRIPE" # Sera généré plus tard

NEXT_PUBLIC_BASE_URL="http://localhost:3000" # L'URL de base de votre application
```

*   **`NEXTAUTH_SECRET`** : Vous pouvez générer une chaîne aléatoire en utilisant `openssl rand -base64 32` ou un outil similaire.
*   **Clés Stripe** : Obtenez-les depuis votre [Tableau de bord Stripe](https://dashboard.stripe.com/test/apikeys). Utilisez vos clés de **test** pour le développement.

### 4. Configuration de la Base de Données

Ce projet utilise Prisma.

#### a. Exécuter les Migrations

Appliquez les migrations de base de données existantes pour créer les tables nécessaires.

```bash
npx prisma migrate dev --name init
```

Cela appliquera les migrations à votre base de données MySQL configurée dans le fichier `.env.local`.

#### b. Générer le Client Prisma

```bash
npx prisma generate
```

### 5. Configuration du Webhook Stripe

Stripe doit envoyer des événements à votre application. Pour le développement local, vous utiliserez l'interface de ligne de commande (CLI) de Stripe.

#### a. Installer la CLI Stripe

Suivez les instructions [ici](https://stripe.com/docs/stripe-cli#install) pour installer la CLI Stripe pour votre système d'exploitation.

#### b. Se Connecter à la CLI Stripe

```bash
stripe login
```

Cela ouvrira une fenêtre de navigateur pour authentifier votre CLI avec votre compte Stripe.

**Note :** Pour que les webhooks Stripe fonctionnent, votre environnement local doit être accessible depuis Internet. Dans ce projet, [ngrok](https://ngrok.com/) a été utilisé pour exposer le port 3000 (`ngrok http 3000`). La commande `stripe listen` décrite ci-dessous est une alternative qui remplit la même fonction.

#### c. Transférer les Événements Webhook

Dans un terminal séparé, exécutez la commande suivante pour transférer les événements webhook de Stripe vers votre application locale.

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Cette commande affichera un secret `whsec_`. **Copiez ce secret** et ajoutez-le à votre fichier `.env.local` en tant que `STRIPE_WEBHOOK_SECRET`.

### 6. Créer des Produits et des Prix Stripe

Pour que les plans d'abonnement fonctionnent, vous devez créer des produits et des prix correspondants dans votre tableau de bord Stripe.

Accédez à votre [Tableau de bord Stripe](https://dashboard.stripe.com/test/products) (en mode test) et créez trois produits avec des prix récurrents :

*   **Produit 1 : Basic**
    *   Prix : 10 EUR (récurrent, mensuel)
    *   **Copiez l'ID du prix** (par exemple, `price_1POfzALd6gO3q4Vb2GUk8b8i`)
*   **Produit 2 : Premium**
    *   Prix : 25 EUR (récurrent, mensuel)
    *   **Copiez l'ID du prix** (par exemple, `price_1POfzALd6gO3q4Vb2GUk8b8j`)
*   **Produit 3 : Pro**
    *   Prix : 50 EUR (récurrent, mensuel)
    *   **Copiez l'ID du prix** (par exemple, `price_1POfzALd6gO3q4Vb2GUk8b8k`)

**Important :** Mettez à jour les valeurs `priceId` dans `src/lib/stripe/plans.ts` avec les ID de prix réels que vous avez copiés depuis votre tableau de bord Stripe.

```typescript
// src/lib/stripe/plans.ts
export const plans = [
  {
    name: "Basic",
    price: 10,
    priceId: "VOTRE_ID_PRIX_BASIC", // <--- METTRE À JOUR
    level: 1,
    features: ["Fonctionnalité de base 1", "Fonctionnalité de base 2"],
  },
  {
    name: "Premium",
    price: 25,
    priceId: "VOTRE_ID_PRIX_PREMIUM", // <--- METTRE À JOUR
    level: 2,
    features: ["Fonctionnalité Premium 1", "Fonctionnalité Premium 2"],
  },
  {
    name: "Pro",
    price: 50,
    priceId: "VOTRE_ID_PRIX_PRO", // <--- METTRE À JOUR
    level: 3,
    features: ["Fonctionnalité Pro 1", "Fonctionnalité Pro 2"],
  },
];
```

### 7. Démarrer le Serveur de Développement

```bash
npm run dev
# ou
yarn dev
```

L'application devrait maintenant fonctionner à l'adresse `http://localhost:3000`.

## Tester le Projet

### 1. Inscription et Connexion Utilisateur

*   Ouvrez `http://localhost:3000/auth/signup` dans votre navigateur.
*   Enregistrez un nouvel utilisateur.
*   Connectez-vous avec l'utilisateur nouvellement créé.

### 2. S'abonner à un Plan

*   Naviguez vers `http://localhost:3000/subscribe`.
*   Vous devriez voir les plans disponibles.
*   Cliquez sur "S'abonner" sur l'un des plans. Cela vous redirigera vers Stripe Checkout.
*   Terminez le processus de paiement en utilisant les [numéros de carte de test](https://stripe.com/docs/testing#cards) de Stripe.
*   Après un paiement réussi, vous serez redirigé vers `http://localhost:3000/success`. Le webhook devrait traiter l'événement et mettre à jour le statut d'abonnement de votre utilisateur dans la base de données.

### 3. Vérifier le Statut de l'Abonnement

*   Après vous être abonné, naviguez à nouveau vers `http://localhost:3000/subscribe`.
*   Vous devriez maintenant voir votre plan actuel mis en évidence, et seuls les plans de niveau supérieur (le cas échéant) disponibles pour la mise à niveau.
*   Naviguez vers `http://localhost:3000/dashboard`. Vous devriez voir les détails de votre abonnement actuel et son statut.

### 4. Mettre à Niveau un Plan

*   Depuis `http://localhost:3000/subscribe`, sélectionnez un plan de niveau supérieur et procédez au paiement.
*   Le webhook mettra à jour votre abonnement vers le nouveau plan.

### 5. Annuler un Abonnement

*   Allez sur `http://localhost:3000/dashboard`.
*   Cliquez sur le bouton "Annuler l'abonnement".
*   Confirmez l'annulation. Le statut de votre abonnement devrait passer à "annulé" ou similaire, et le `stripePriceId` de votre utilisateur sera défini sur `null` dans la base de données.

### 6. Inspection de la Base de Données (Facultatif)

Vous pouvez inspecter votre base de données SQLite locale à l'aide d'un outil comme [DB Browser for SQLite](https://sqlitebrowser.org/) pour vérifier que les données utilisateur et d'abonnement sont correctement mises à jour. Le fichier de base de données est situé dans `prisma/dev.db`.

---

Ce `README.student.md` devrait fournir un guide complet pour quiconque souhaite comprendre, reproduire et tester votre projet.