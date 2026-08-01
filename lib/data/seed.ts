import type {
  ActivityLog,
  Admin,
  Category,
  Comment,
  MediaItem,
  Post,
  PostStatus,
  Site,
  Tag,
} from "@/lib/types";
import { estimateReadingTime, slugify } from "@/lib/utils";

/**
 * Date de référence du jeu de données. Fixe et non aléatoire : le seed doit
 * être strictement déterministe (même rendu serveur et client).
 */
export const SEED_REFERENCE_DATE = new Date("2026-08-01T09:00:00.000Z");

/** PRNG déterministe — pas de Math.random dans le seed. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date(SEED_REFERENCE_DATE);
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAhead(days: number, hour = 9, minute = 30): string {
  return daysAgo(-days, hour, minute);
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export const seedAdmin: Admin = {
  id: "admin-1",
  name: "Amir Zoutor",
  email: "amir@lfc.studio",
};

/* -------------------------------------------------------------------------- */
/* Sites — 5 clients, 5 couleurs d'accent nettement distinctes                 */
/* -------------------------------------------------------------------------- */

export const seedSites: Site[] = [
  {
    id: "camci",
    name: "CAMCI",
    domain: "camci.cm",
    accentColor: "#2563EB",
    locale: "fr",
    timezone: "Africa/Douala",
    status: "active",
    postsCount: 8,
  },
  {
    id: "fresh-fish",
    name: "Fresh Fish Cameroon",
    domain: "freshfish.cm",
    accentColor: "#0E9AA7",
    locale: "fr",
    timezone: "Africa/Douala",
    status: "active",
    postsCount: 8,
  },
  {
    id: "fiagsa",
    name: "FIAGSA",
    domain: "fiagsa.com",
    accentColor: "#4D7C2F",
    locale: "fr",
    timezone: "Africa/Douala",
    status: "active",
    postsCount: 8,
  },
  {
    id: "benchland",
    name: "Benchland",
    domain: "benchland.io",
    accentColor: "#7C5CFF",
    locale: "en",
    timezone: "Europe/Paris",
    status: "active",
    postsCount: 8,
  },
  {
    id: "primo",
    name: "Primo",
    domain: "primo.africa",
    accentColor: "#D4483B",
    locale: "fr",
    timezone: "Africa/Douala",
    status: "suspended",
    postsCount: 8,
  },
];

/* -------------------------------------------------------------------------- */
/* Contenu par site                                                           */
/* -------------------------------------------------------------------------- */

interface SiteContent {
  categories: { name: string; description: string; color: string }[];
  tags: string[];
  posts: { title: string; excerpt: string }[];
  media: string[];
}

const CONTENT: Record<string, SiteContent> = {
  camci: {
    categories: [
      {
        name: "Actualités",
        description: "Les annonces et communiqués de la chambre.",
        color: "#2563EB",
      },
      {
        name: "Réglementation",
        description: "Textes, décrets et obligations des entreprises.",
        color: "#7C5CFF",
      },
      {
        name: "Événements",
        description: "Salons, forums et rencontres professionnelles.",
        color: "#0E9AA7",
      },
    ],
    tags: ["commerce", "industrie", "PME", "export", "douanes"],
    posts: [
      {
        title: "Nouvelles procédures douanières au port de Douala",
        excerpt:
          "Le guichet unique se dématérialise : ce qui change concrètement pour les importateurs dès le mois prochain.",
      },
      {
        title: "Forum économique CAMCI 2026 : le programme complet",
        excerpt:
          "Trois jours de rencontres entre acheteurs internationaux et producteurs locaux, secteur par secteur.",
      },
      {
        title: "Créer son entreprise au Cameroun : le guide en 7 étapes",
        excerpt:
          "Du choix de la forme juridique à l'immatriculation, un parcours balisé pour les créateurs.",
      },
      {
        title: "Financement des PME : les dispositifs disponibles en 2026",
        excerpt:
          "Garanties, lignes de crédit et subventions — un panorama des mécanismes accessibles aux PME.",
      },
      {
        title: "Zone de libre-échange africaine : premier bilan",
        excerpt:
          "Deux ans après l'entrée en vigueur, quels flux ont réellement changé pour les exportateurs.",
      },
      {
        title: "Certification qualité : par où commencer",
        excerpt:
          "Comprendre les référentiels, estimer le coût et planifier un audit sans se tromper de priorité.",
      },
      {
        title: "Rencontres acheteurs : mode d'emploi",
        excerpt:
          "Préparer un rendez-vous d'affaires en 30 minutes, avec la trame utilisée par nos conseillers.",
      },
      {
        title: "Baromètre trimestriel de l'activité commerciale",
        excerpt:
          "Les indicateurs du trimestre commentés secteur par secteur, avec les données brutes en annexe.",
      },
    ],
    media: [
      "port-douala.jpg",
      "forum-2026.jpg",
      "logo-camci.svg",
      "salle-conference.jpg",
      "brochure-pme.pdf",
      "equipe-conseil.jpg",
    ],
  },
  "fresh-fish": {
    categories: [
      {
        name: "Produits",
        description: "Nos arrivages et espèces disponibles.",
        color: "#0E9AA7",
      },
      {
        name: "Recettes",
        description: "Préparations simples et de saison.",
        color: "#D4483B",
      },
      {
        name: "Pêche durable",
        description: "Traçabilité, quotas et bonnes pratiques.",
        color: "#4D7C2F",
      },
    ],
    tags: ["fraîcheur", "recette", "traçabilité", "livraison", "saison"],
    posts: [
      {
        title: "Comment reconnaître un poisson vraiment frais",
        excerpt:
          "Œil, branchies, fermeté, odeur : les quatre contrôles à faire avant d'acheter, en moins d'une minute.",
      },
      {
        title: "Arrivage de la semaine : bar, dorade et capitaine",
        excerpt:
          "Les espèces disponibles cette semaine, leurs tailles moyennes et leur meilleur mode de cuisson.",
      },
      {
        title: "Notre chaîne du froid, expliquée de bout en bout",
        excerpt:
          "Du bateau à votre cuisine : chaque étape, sa température cible et son point de contrôle.",
      },
      {
        title: "Braisé de capitaine aux épices douces",
        excerpt:
          "Une recette de 35 minutes qui marche à tous les coups, même sans matériel particulier.",
      },
      {
        title: "Pêche responsable : nos engagements pour 2026",
        excerpt:
          "Zones de capture, tailles minimales et partenariats avec les coopératives locales.",
      },
      {
        title: "Conserver le poisson sans le dénaturer",
        excerpt:
          "Réfrigération, congélation, sous-vide : ce que chaque méthode fait vraiment à la chair.",
      },
      {
        title: "Livraison à Douala et Yaoundé : nouveaux créneaux",
        excerpt:
          "Deux créneaux supplémentaires en soirée, et un suivi de commande enfin lisible.",
      },
      {
        title: "Filets, darnes, entier : que choisir selon la cuisson",
        excerpt:
          "Un tableau de correspondance entre découpe, cuisson et rendu final en assiette.",
      },
    ],
    media: [
      "etal-marche.jpg",
      "bar-frais.jpg",
      "chaine-froid.jpg",
      "recette-braise.jpg",
      "bateau-peche.jpg",
      "logo-freshfish.svg",
    ],
  },
  fiagsa: {
    categories: [
      {
        name: "Agriculture",
        description: "Itinéraires techniques et conduite de culture.",
        color: "#4D7C2F",
      },
      {
        name: "Marchés",
        description: "Prix, débouchés et tendances filières.",
        color: "#A3620A",
      },
      {
        name: "Formation",
        description: "Sessions, ateliers et ressources pédagogiques.",
        color: "#2563EB",
      },
    ],
    tags: ["cacao", "irrigation", "coopérative", "sols", "récolte"],
    posts: [
      {
        title: "Préparer la saison sèche : irrigation et paillage",
        excerpt:
          "Trois techniques peu coûteuses pour limiter le stress hydrique sans surdimensionner l'installation.",
      },
      {
        title: "Cacao : les prix de campagne et ce qu'ils impliquent",
        excerpt:
          "Lecture des cours, calendrier de vente et arbitrages possibles pour les producteurs.",
      },
      {
        title: "Analyse de sol : lire son rapport sans se tromper",
        excerpt:
          "pH, matière organique, CEC — ce que chaque ligne veut dire, et les décisions qui en découlent.",
      },
      {
        title: "Monter une coopérative : statuts et gouvernance",
        excerpt:
          "Les décisions structurantes à prendre dès la première assemblée, avec un modèle de statuts.",
      },
      {
        title: "Post-récolte : réduire les pertes de 30 %",
        excerpt:
          "Séchage, tri et stockage : les gestes qui pèsent le plus sur la qualité marchande.",
      },
      {
        title: "Atelier terrain : conduite du verger",
        excerpt:
          "Deux jours de pratique sur taille, fertilisation et suivi sanitaire, en groupe restreint.",
      },
      {
        title: "Financer son matériel agricole",
        excerpt:
          "Crédit-bail, groupement d'achat ou autofinancement : comparer sur le coût réel à l'hectare.",
      },
      {
        title: "Certification biologique : le parcours réel",
        excerpt:
          "Durée de conversion, coûts d'audit et retour d'expérience de deux exploitations accompagnées.",
      },
    ],
    media: [
      "champ-cacao.jpg",
      "irrigation-goutte.jpg",
      "atelier-terrain.jpg",
      "analyse-sol.pdf",
      "sechage-feves.jpg",
      "logo-fiagsa.svg",
    ],
  },
  benchland: {
    categories: [
      {
        name: "Produit",
        description: "Nouveautés et évolutions de la plateforme.",
        color: "#7C5CFF",
      },
      {
        name: "Ingénierie",
        description: "Architecture, performance et retours d'expérience.",
        color: "#2563EB",
      },
      {
        name: "Études de cas",
        description: "Déploiements clients et résultats mesurés.",
        color: "#0E9AA7",
      },
    ],
    tags: ["performance", "API", "benchmark", "observabilité", "SaaS"],
    posts: [
      {
        title: "Mesurer la latence sans se mentir",
        excerpt:
          "Pourquoi la moyenne masque l'essentiel, et comment lire p95 et p99 dans un contexte réel.",
      },
      {
        title: "Benchland 3.0 : ce qui change",
        excerpt:
          "Nouvelle API de collecte, rapports comparatifs et export brut des séries temporelles.",
      },
      {
        title: "Réduire de 40 % le coût d'une chaîne de tests",
        excerpt:
          "Le détail d'une migration : parallélisation, cache d'artefacts et suppression des tests redondants.",
      },
      {
        title: "Instrumenter une application sans la ralentir",
        excerpt:
          "Échantillonnage, budgets de traces et points d'attention sur les environnements contraints.",
      },
      {
        title: "Étude de cas : 12 000 requêtes par seconde",
        excerpt:
          "Ce qu'un client fintech a changé dans son architecture pour tenir ses pics de charge.",
      },
      {
        title: "Choisir ses indicateurs de performance",
        excerpt:
          "Un cadre en quatre questions pour arrêter de suivre des métriques qui ne décident de rien.",
      },
      {
        title: "Notre approche des tests de charge",
        excerpt:
          "Scénarios, montée en charge et critères d'arrêt : la méthode que nous appliquons en interne.",
      },
      {
        title: "Journal de bord : refonte du moteur de rapports",
        excerpt:
          "Six semaines de travail résumées, y compris les deux impasses techniques rencontrées.",
      },
    ],
    media: [
      "dashboard-preview.png",
      "architecture.svg",
      "team-offsite.jpg",
      "benchmark-report.pdf",
      "logo-benchland.svg",
      "latency-chart.png",
    ],
  },
  primo: {
    categories: [
      {
        name: "Marque",
        description: "Identité, positionnement et prises de parole.",
        color: "#D4483B",
      },
      {
        name: "Conseils",
        description: "Guides pratiques pour nos clients.",
        color: "#A3620A",
      },
      {
        name: "Coulisses",
        description: "L'équipe, les projets et la fabrication.",
        color: "#7C5CFF",
      },
    ],
    tags: ["design", "identité", "atelier", "client", "méthode"],
    posts: [
      {
        title: "Une identité de marque tient en trois décisions",
        excerpt:
          "Ce que nous tranchons systématiquement avant d'ouvrir le moindre outil de design.",
      },
      {
        title: "Refonte Primo : le making-of",
        excerpt:
          "Du premier atelier au lancement, les arbitrages qui ont façonné la nouvelle identité.",
      },
      {
        title: "Brief créatif : le modèle que nous utilisons",
        excerpt:
          "Un document d'une page qui remplace trois réunions, avec des exemples remplis.",
      },
      {
        title: "Choisir ses typographies sans y passer trois semaines",
        excerpt:
          "Une méthode d'élimination en quatre passes, et les pièges de licence à connaître.",
      },
      {
        title: "Ce que nous avons appris de 40 ateliers clients",
        excerpt:
          "Les questions qui débloquent une discussion, et celles qui la font systématiquement dérailler.",
      },
      {
        title: "Décliner une identité sur cinq supports",
        excerpt:
          "Du papier à l'interface, comment garder la cohérence sans figer le système.",
      },
      {
        title: "Notre processus, expliqué aux clients",
        excerpt:
          "Quatre phases, des livrables clairs et les moments où votre décision est vraiment attendue.",
      },
      {
        title: "Archives : dix projets, dix leçons",
        excerpt:
          "Une rétrospective honnête, y compris sur les projets qui ne se sont pas bien passés.",
      },
    ],
    media: [
      "moodboard.jpg",
      "atelier-client.jpg",
      "logo-primo.svg",
      "charte-graphique.pdf",
      "papeterie.jpg",
      "signaletique.jpg",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Génération                                                                 */
/* -------------------------------------------------------------------------- */

/** Statuts distribués de façon à couvrir les 4 valeurs sur chaque site. */
const STATUS_CYCLE: PostStatus[] = [
  "published",
  "published",
  "published",
  "draft",
  "scheduled",
  "published",
  "archived",
  "draft",
];

function buildContent(title: string, excerpt: string, siteName: string): string {
  return [
    `<p>${excerpt}</p>`,
    `<h2>Le contexte</h2>`,
    `<p>Cet article a été rédigé par l'équipe éditoriale de ${siteName}. Il fait le point sur un sujet qui revient régulièrement dans les échanges avec nos lecteurs, et propose une lecture directe, sans détour.</p>`,
    `<p>La première chose à poser, c'est le cadre : qui est concerné, à quel moment, et avec quelles contraintes. Sans cela, les recommandations qui suivent restent théoriques.</p>`,
    `<h2>Ce qu'il faut retenir</h2>`,
    `<ul><li>Un point de départ clair, formulé en une phrase.</li><li>Deux ou trois décisions structurantes à prendre tôt.</li><li>Un indicateur simple pour vérifier que l'on avance.</li></ul>`,
    `<blockquote><p>« ${title} » — le sujet paraît large, mais il se ramène à quelques arbitrages concrets.</p></blockquote>`,
    `<h2>En pratique</h2>`,
    `<p>Commencez petit et mesurez. La plupart des erreurs viennent d'un dimensionnement trop ambitieux dès le premier jour, rarement d'un manque d'outils.</p>`,
    `<p>Si vous avez des questions sur ce sujet, l'équipe reste joignable et répond sous 48 heures ouvrées.</p>`,
  ].join("\n");
}

function generateForSite(site: Site) {
  const content = CONTENT[site.id];
  const rand = mulberry32(
    site.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 7)
  );

  const categories: Category[] = content.categories.map((cat, index) => ({
    id: `${site.id}-cat-${index + 1}`,
    siteId: site.id,
    name: cat.name,
    slug: slugify(cat.name),
    description: cat.description,
    color: cat.color,
    postCount: 0,
  }));

  const tags: Tag[] = content.tags.map((name, index) => ({
    id: `${site.id}-tag-${index + 1}`,
    siteId: site.id,
    name,
    slug: slugify(name),
    postCount: 0,
  }));

  const posts: Post[] = content.posts.map((entry, index) => {
    const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
    const created = daysAgo(120 - index * 13, 8 + (index % 6), (index * 7) % 60);
    const updated = daysAgo(60 - index * 6, 11, (index * 13) % 60);
    const html = buildContent(entry.title, entry.excerpt, site.name);

    const categoryIds = [categories[index % categories.length].id];
    const tagIds = [
      tags[index % tags.length].id,
      tags[(index + 2) % tags.length].id,
    ];

    return {
      id: `${site.id}-post-${index + 1}`,
      siteId: site.id,
      title: entry.title,
      slug: slugify(entry.title),
      excerpt: entry.excerpt,
      content: html,
      coverImage: undefined,
      status,
      categoryIds,
      tagIds,
      authorId: seedAdmin.id,
      publishedAt:
        status === "published" || status === "archived"
          ? daysAgo(55 - index * 6, 9, 15)
          : undefined,
      scheduledAt: status === "scheduled" ? daysAhead(4 + index) : undefined,
      createdAt: created,
      updatedAt: updated,
      readingTime: estimateReadingTime(html),
      views:
        status === "published"
          ? 180 + Math.floor(rand() * 4200)
          : status === "archived"
            ? 90 + Math.floor(rand() * 800)
            : 0,
      seo: {
        metaTitle: `${entry.title} — ${site.name}`,
        metaDescription: entry.excerpt.slice(0, 155),
      },
    };
  });

  // Compteurs cohérents avec les posts générés.
  for (const post of posts) {
    for (const id of post.categoryIds) {
      const cat = categories.find((c) => c.id === id);
      if (cat) cat.postCount += 1;
    }
    for (const id of post.tagIds) {
      const tag = tags.find((t) => t.id === id);
      if (tag) tag.postCount += 1;
    }
  }

  const commentAuthors = [
    ["Nadège Fokou", "nadege.fokou@example.cm"],
    ["Serge Mbarga", "s.mbarga@example.cm"],
    ["Claire Dupont", "claire.dupont@example.fr"],
    ["Yannick Ondoa", "yannick@example.cm"],
    ["promo-seo-2026", "contact@backlinks-cheap.example"],
    ["Aïcha Bello", "aicha.bello@example.cm"],
  ];
  const commentBodies = [
    "Merci pour cet article, très clair. Une précision sur le deuxième point serait la bienvenue.",
    "Est-ce que cela s'applique aussi aux structures de moins de dix personnes ?",
    "J'ai testé la méthode décrite, les résultats sont conformes à ce qui est annoncé.",
    "Article utile, mais il manque des chiffres sur le coût réel de la démarche.",
    "Boostez votre trafic avec 5000 backlinks garantis, cliquez ici pour l'offre du jour.",
    "Bonne synthèse. Auriez-vous des sources complémentaires sur la partie réglementaire ?",
  ];
  const commentStatuses = [
    "pending",
    "approved",
    "approved",
    "pending",
    "spam",
    "approved",
  ] as const;

  const publishedPosts = posts.filter((p) => p.status === "published");
  const comments: Comment[] = commentAuthors.map((author, index) => {
    const post = publishedPosts[index % Math.max(1, publishedPosts.length)];
    return {
      id: `${site.id}-comment-${index + 1}`,
      postId: post.id,
      siteId: site.id,
      authorName: author[0],
      authorEmail: author[1],
      content: commentBodies[index],
      status: commentStatuses[index],
      createdAt: daysAgo(index * 3 + 1, 14, index * 9),
    };
  });

  const media: MediaItem[] = content.media.map((name, index) => {
    const ext = name.split(".").pop() ?? "jpg";
    const type =
      ext === "pdf"
        ? "application/pdf"
        : ext === "svg"
          ? "image/svg+xml"
          : ext === "png"
            ? "image/png"
            : "image/jpeg";
    return {
      id: `${site.id}-media-${index + 1}`,
      siteId: site.id,
      url: `/media/${site.id}/${name}`,
      name,
      type,
      size: 40_000 + Math.floor(rand() * 2_400_000),
      uploadedAt: daysAgo(index * 8 + 2, 16, 0),
    };
  });

  // Le journal doit rester cohérent avec l'état réel des articles : on cible
  // un article dont le statut correspond à l'action décrite.
  const pickByStatus = (status: PostStatus, fallback: number) =>
    (posts.find((p) => p.status === status) ?? posts[fallback]).title;

  const activityTemplates: { action: string; target: (i: number) => string }[] = [
    { action: "a publié l'article", target: () => pickByStatus("published", 0) },
    { action: "a modifié l'article", target: (i) => posts[(i + 1) % posts.length].title },
    { action: "a approuvé un commentaire de", target: (i) => comments[i % comments.length].authorName },
    { action: "a téléversé le média", target: (i) => media[i % media.length].name },
    { action: "a créé la catégorie", target: (i) => categories[i % categories.length].name },
    { action: "a planifié l'article", target: () => pickByStatus("scheduled", 4) },
    { action: "a archivé l'article", target: () => pickByStatus("archived", 6) },
    { action: "a mis à jour les réglages du site", target: () => site.name },
  ];

  const activity: ActivityLog[] = activityTemplates.map((tpl, index) => ({
    id: `${site.id}-activity-${index + 1}`,
    siteId: site.id,
    userId: seedAdmin.id,
    action: tpl.action,
    target: tpl.target(index),
    timestamp: daysAgo(index, 9 + (index % 8), (index * 11) % 60),
  }));

  return { categories, tags, posts, comments, media, activity };
}

const generated = seedSites.map((site) => generateForSite(site));

export const seedCategories: Category[] = generated.flatMap((g) => g.categories);
export const seedTags: Tag[] = generated.flatMap((g) => g.tags);
export const seedPosts: Post[] = generated.flatMap((g) => g.posts);
export const seedComments: Comment[] = generated.flatMap((g) => g.comments);
export const seedMedia: MediaItem[] = generated.flatMap((g) => g.media);
export const seedActivity: ActivityLog[] = generated.flatMap((g) => g.activity);

/**
 * Séries de vues sur 30 jours, par site. Déterministe, avec un creux le
 * week-end pour que la courbe ait une allure crédible.
 */
export function buildViewsSeries(siteId: string, days = 30) {
  const rand = mulberry32(
    siteId.split("").reduce((acc, c) => acc + c.charCodeAt(0) * 3, 31)
  );
  const base = 120 + Math.floor(rand() * 260);
  const series: { date: string; views: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(SEED_REFERENCE_DATE);
    day.setUTCDate(day.getUTCDate() - i);
    day.setUTCHours(0, 0, 0, 0);
    const weekday = day.getUTCDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.62 : 1;
    const trend = 1 + (days - i) / (days * 3);
    // Bruit contenu : la courbe doit rester lisible, pas nerveuse.
    const noise = 0.86 + rand() * 0.28;
    series.push({
      date: day.toISOString(),
      views: Math.max(12, Math.round(base * weekendFactor * trend * noise)),
    });
  }
  return series;
}

export const seedViewsSeries: Record<string, { date: string; views: number }[]> =
  Object.fromEntries(seedSites.map((s) => [s.id, buildViewsSeries(s.id)]));
