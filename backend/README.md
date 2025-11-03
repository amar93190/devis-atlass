# Diego Backend

API Express (TypeScript) pour Diego – coach IA football.

## Scripts

```bash
npm run dev --workspace backend    # mode développement avec ts-node-dev
npm run build --workspace backend  # transpilation TypeScript
npm run start --workspace backend  # lance dist/server.js
npm run lint --workspace backend   # ESLint
npm run test --workspace backend   # Vitest (placeholder)
```

## Endpoints principaux

- `POST /coach/plan` : génère un plan personnalisé avec OpenAI (token Firebase requis).
- `GET /billing/current` : retourne le quota et le palier actuel (sans paiement pour cette démo).
- `GET|POST /auth/profile` : gestion du profil joueur.
- `POST /uploads/media` : placeholder pour upload.

## Configuration

Renseigner `.env` (voir `.env.example`) avec :

- clé OpenAI (`OPENAI_API_KEY`)
- identifiants Service Account Firebase (project ID, client email, private key, storage bucket)
- `FRONTEND_URL` pour configurer CORS

## TODO

- Gérer les fichiers médias via Firebase Storage.
- Ajouter des tests d’intégration (Firebase emulator, mock OpenAI).
