# Diego Web (React + Vite)

Interface web reproduisant la maquette Diego avec React, Vite et styled-components.

## Scripts

```bash
npm run dev --workspace web       # serveur Vite (http://localhost:5173)
npm run build --workspace web     # build de production
npm run preview --workspace web   # prévisualisation
npm run lint --workspace web      # ESLint
```

## Structure

- `src/components/` : éléments UI (Sidebar, HeroInput, ChatBubble, PlanAccordion, etc.).
- `src/pages/` : pages Chat, Dashboard, Subscriptions, Settings.
- `src/store/` : état du chat (Zustand + persistance).
- `src/hooks/` : hooks (chat, breakpoint).
- `src/theme/` : couleurs, typographies, global CSS (Police Barlow depuis Google Fonts).

## Intégration API

Le service `src/services/api.ts` cible `VITE_API_URL` (défaut `http://localhost:4000`).
Pour l’instant les appels nécessitent un token Firebase (Authorization: Bearer) que vous pourrez injecter avant requête.

## TODO

- Brancher l’authentification (Firebase) pour récupérer le token et sécuriser les appels.
- Connecter l’onboarding et le dashboard aux endpoints réels.
- Ajouter les assets finaux (logos, icônes) dans `public/`.
