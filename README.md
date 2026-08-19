# Sogafric Blog — dashboard multi-tenant

Interface d'administration des blogs de plusieurs entreprises, branchée sur
l'API Spring documentée dans `/v3/api-docs`.

```bash
npm install
cp .env.example .env.local   # puis renseigner NEXT_PUBLIC_API_BASE_URL
npm run dev
```

Connexion sur `/login`. Sans jeton valide, toutes les routes du dashboard
redirigent vers cet écran.

## Stack

- **Next.js 16** (App Router, Turbopack) et **React 19**
- **TanStack Query v5** — cache, invalidation, états de chargement
- **Zod v4** — validation de **toutes** les réponses réseau
- **axios** — intercepteurs jeton + rafraîchissement automatique
- **react-hook-form** + `@hookform/resolvers` pour les formulaires
- **Tailwind CSS v4**, **shadcn/ui** (Radix), **Tiptap 3**, **sonner**, **cmdk**

## Architecture des données

```
lib/api/
  schemas.ts     Schémas Zod calqués sur l'OpenAPI (source de vérité des types)
  client.ts      Instance axios, injection du jeton, refresh, helpers multipart
  errors.ts      Normalisation de toute erreur en message français affichable
  auth.ts companies.ts posts.ts stats.ts    Un fichier par ressource

lib/queries/     Hooks TanStack Query (useCompanies, usePosts, useStats…)
lib/auth/        Store du jeton (localStorage) + lecture du `sub` du JWT
lib/theme/       Dérivation déterministe de la couleur d'accent par entreprise
```

Aucun composant n'appelle `fetch` ou `axios` directement : tout passe par
`lib/queries/`, qui appelle `lib/api/`. Chaque réponse est parsée par Zod, donc
une dérive du contrat serveur échoue immédiatement, avec un message explicite.

### Rafraîchissement du jeton

Le jeton d'accès expire au bout de 15 minutes et le backend **fait tourner le
refresh token à chaque appel**. L'intercepteur de réponse rejoue une seule fois
la requête après rafraîchissement, via une promesse partagée pour que deux
requêtes concurrentes n'invalident pas mutuellement leur refresh token. En cas
d'échec, la session est vidée et l'utilisateur renvoyé vers `/login`.

> Spring Security répond **403** (et non 401) quand le jeton manque ou a expiré :
> les deux codes sont traités comme une erreur d'authentification.

## Couverture de l'API

| Écran | Endpoints |
| --- | --- |
| Connexion, mot de passe | `POST /auth/login`, `/auth/refresh`, `/auth/reset-password` |
| Vue d'ensemble | `GET /stats`, `GET /posts` |
| Entreprises | `GET/POST /companies`, `GET/PUT/DELETE /companies/{id}` |
| Articles + éditeur | `GET/POST /posts`, `GET/PUT/DELETE /posts/{id}` |
| Catégories, Médias, Commentaires | *aucun endpoint — écrans en attente* |

Les trois derniers modules affichent l'état réel (« non disponible côté API »)
et la liste des routes attendues, plutôt que des données inventées.

## Contraintes du backend prises en compte

- **Contenu d'article plafonné à 6 000 caractères.** `POST`/`PUT /posts`
  reçoivent `title`, `content`, `excerpt`… en **paramètres d'URL**. Au-delà
  d'environ 8 Ko d'URL, Tomcat répond 400 (mesuré : 6 000 passent, 8 000
  échouent). L'éditeur affiche un compteur et bloque l'envoi avant l'appel.
- **Corps multipart obligatoire.** Ces mêmes routes refusent une requête sans
  corps (415) : un `FormData` est toujours envoyé, vide si aucun fichier.
- **Deux statuts seulement** : `DRAFT` et `PUBLISHED`.
- **`/stats` est global** — il n'accepte pas de filtre par entreprise.
- **Pas de recherche plein texte** : le champ de la liste filtre la page chargée,
  et son libellé le dit.
- **Pas de couleur par entreprise** : l'accent est dérivé du code de
  l'entreprise, donc stable partout sans être stocké.
- `logoUrl` vaut parfois la chaîne littérale `"string"` dans les données
  existantes : le schéma Zod la normalise en `null`.

## Changer d'environnement

`NEXT_PUBLIC_API_BASE_URL` dans `.env.local`. L'écran **Paramètres** affiche
l'URL utilisée et l'état de la connexion.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build |
| `npm run lint` | ESLint |
