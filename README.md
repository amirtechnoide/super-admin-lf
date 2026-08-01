# Studio Blog — dashboard multi-tenant

Interface d'administration unique pour les blogs de cinq sites clients
(CAMCI, Fresh Fish Cameroon, FIAGSA, Benchland, Primo).

**UI seule.** Aucune base, aucune route API, aucune authentification réelle :
toutes les données viennent d'une couche mockée isolée, prête à être remplacée
par votre API.

```bash
npm install
npm run dev
```

Puis <http://localhost:3000>. L'écran de connexion est sur `/login` (il redirige
vers `/` sans vérifier quoi que ce soit).

## Stack

- **Next.js 16** (App Router, Turbopack) et **React 19**
- **Tailwind CSS v4** — tokens en variables CSS dans `app/globals.css`
- **shadcn/ui** (primitives Radix, écrites dans `components/ui/`)
- **Tiptap 3** pour l'éditeur riche
- **Zustand** pour le site actif et l'admin courant
- **lucide-react**, **sonner** (toasts), **cmdk** (⌘K), **next-themes** (dark mode)

## Structure

```
app/
  layout.tsx              Fontes, thème, providers
  login/                  Écran de connexion (hors shell)
  (dashboard)/            Toutes les pages sous sidebar + topbar
    page.tsx              Vue d'ensemble (KPIs, courbe, activité)
    sites/                Liste des sites · [id] = configuration
    posts/                Liste · new · [id]/edit (éditeur)
    categories/           Catégories & tags (2 onglets)
    media/                Bibliothèque média
    comments/             Modération
    settings/             Paramètres
    profile/              Profil admin

components/
  ui/                     Primitives shadcn/ui + DataTable, EmptyState, ConfirmDialog…
  layout/                 Sidebar, topbar, site-switcher, recherche ⌘K, thème
  editor/                 Éditeur Tiptap, panneau SEO, aperçu, sélecteur de média
  dashboard/              Cartes KPI, courbe des vues, flux d'activité
  sites/                  Sélecteur de couleur d'accent
  media/                  Vignette de média

lib/
  types.ts                Modèles de données
  utils.ts                cn, slugify, formats de date, contraste…
  data/                   👉 Couche de données mockée (voir ci-dessous)
  store/app-store.ts      Site actif + admin (Zustand)
  hooks/use-async.ts      Chargement, erreur, reload
```

## Où brancher l'API

Tout passe par **`lib/data/`** : aucun composant ne fait de `fetch`.

```
lib/data/
  index.ts        Ré-exporte tout — porte le commentaire « 🔌 Point de branchement API »
  seed.ts         Jeu de données déterministe (5 sites, 8 articles/site, etc.)
  db.ts           Store en mémoire + sleep() + helpers
  sites.ts posts.ts categories.ts tags.ts comments.ts media.ts activity.ts admin.ts
```

Chaque fonction est **asynchrone** et simule une latence (`await sleep(300)`).
Pour brancher votre backend, remplacez uniquement le corps des fonctions — les
signatures et les écrans ne bougent pas :

```ts
// Avant
export async function getPosts(filters: PostFilters = {}): Promise<Paginated<Post>> {
  await sleep(320);
  /* filtrage en mémoire */
}

// Après
export async function getPosts(filters: PostFilters = {}): Promise<Paginated<Post>> {
  const response = await fetch(`/api/posts?${new URLSearchParams(/* … */)}`);
  if (!response.ok) throw new Error("Chargement des articles impossible");
  return response.json();
}
```

Conventions utiles :

- `siteId` vaut `null` pour la vue agrégée « Tous les sites ».
- Les mutations mettent à jour le store en mémoire : créer, éditer ou supprimer
  se voit immédiatement dans l'UI. **Un rechargement de page repart du seed.**
- Les écrans appellent ces fonctions via `useAsync(...)`, qui expose
  `{ data, loading, error, reload }`.

## Ajouter un site

Deux façons :

1. **Depuis l'UI** — `/sites` → « Ajouter un site ». Le site apparaît aussitôt
   dans le switcher (perdu au rechargement, comme toute mutation mockée).
2. **Dans le seed** — pour un site permanent, éditez `lib/data/seed.ts` :

```ts
// 1. Ajouter l'entrée dans seedSites
{
  id: "nouveau-client",
  name: "Nouveau Client",
  domain: "nouveau-client.com",
  accentColor: "#B8336A",   // couleur d'accent, distincte des autres
  locale: "fr",
  timezone: "Africa/Douala",
  status: "active",
  postsCount: 8,
}

// 2. Ajouter la clé correspondante dans CONTENT
"nouveau-client": {
  categories: [ /* … */ ],
  tags: [ /* … */ ],
  posts: [ /* 8 entrées { title, excerpt } */ ],
  media: [ /* noms de fichiers */ ],
}
```

Articles, catégories, tags, commentaires, médias et activité sont générés
automatiquement à partir de ces deux blocs.

## Multi-tenant et couleur d'accent

Le site actif est global (`lib/store/app-store.ts`) et mémorisé dans
`localStorage`. Tout ce qui est affiché — articles, catégories, médias,
commentaires — est filtré par son `siteId`.

Le chrome du dashboard reste **neutre et sans marque** ; seule la variable CSS
`--accent` change, injectée depuis le site actif par `AccentProvider`
(`components/providers.tsx`). Elle teinte les badges de statut, la section de
navigation active, les boutons principaux et le focus clavier. En vue
« Tous les sites », l'accent redevient neutre.

## Responsive et accessibilité

- Testé de **360 px** à desktop large, sans débordement horizontal.
- Sidebar en drawer sous `md`, tables en cartes empilées sous `md`, éditeur en
  une colonne avec les réglages en accordéon, barre d'action collante en bas.
- Cibles tactiles ≥ 44 px sur mobile, focus clavier visible (teinté par
  l'accent), `prefers-reduced-motion` respecté, dark mode complet.

## Scripts

| Commande        | Effet                          |
| --------------- | ------------------------------ |
| `npm run dev`   | Serveur de développement       |
| `npm run build` | Build de production            |
| `npm run start` | Sert le build                  |
| `npm run lint`  | ESLint                         |
