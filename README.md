# Devis Express (V1)

Application web interne de génération de devis.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Authentification interne (email + mot de passe)
- Génération PDF côté serveur avec Puppeteer

## Installation

1. Installer les dépendances

```bash
npm install
```

2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

3. Générer le client Prisma

```bash
npm run prisma:generate
```

4. Créer la base de données et appliquer la migration

```bash
npm run prisma:migrate -- --name init
```

5. Injecter les données de démonstration

```bash
npm run db:seed
```

6. Lancer le serveur local

```bash
npm run dev
```

## Connexion de démonstration

- Email: `admin@devis.local`
- Mot de passe: `admin123`

## Export PDF

1. Ouvrir un devis via `/quotes/[id]`
2. Cliquer sur `Télécharger PDF`
3. Ou appeler directement `/api/quotes/{id}/pdf`

## Scripts utiles

- `npm run dev` : serveur de développement
- `npm run build` : build de production
- `npm run start` : exécution production
- `npm run lint` : lint du projet
- `npm run prisma:generate` : génération du client Prisma
- `npm run prisma:migrate -- --name init` : migration locale
- `npm run prisma:push` : sync schéma sans migration
- `npm run db:seed` : données de démonstration
# atlass
# atlass
# devis-atlass
