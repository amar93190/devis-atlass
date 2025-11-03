# Diego – Web + Backend

Monorepo pour l’app web Diego (React + Vite) et l’API Node/Express.

## Structure

- `web/` : application React (Vite + TypeScript) reproduisant la maquette avec barre latérale, entrée héro, bulles de chat et accordéons IA.
- `backend/` : API Express TypeScript reliant Firebase et OpenAI.

## Prérequis

- Node.js 18+
- npm 8+ (gère les workspaces)

## Installation

```bash
npm install
```

### Variables d’environnement

- Copier `web/.env.example` en `web/.env` et définir `VITE_API_URL` (ex: `http://localhost:4000`).
- Copier `backend/.env.example` en `backend/.env` avec les clés OpenAI et Firebase Admin.

## Démarrage

Backend :
```bash
npm run dev --workspace backend
```

Frontend :
```bash
npm run dev --workspace web
```

Accède ensuite à http://localhost:5173.

## Tests & lint

```bash
npm run lint --workspace web
npm run lint --workspace backend
npm run test --workspace backend
```

## Prochaines étapes

- Relier le front aux endpoints réels (auth Firebase, plan IA, quotas).
- Implémenter l’upload média via Firebase Storage.
