import type {
  ActivityLog,
  Admin,
  Category,
  Comment,
  MediaItem,
  Post,
  Site,
  Tag,
} from "@/lib/types";
import {
  seedActivity,
  seedAdmin,
  seedCategories,
  seedComments,
  seedMedia,
  seedPosts,
  seedSites,
  seedTags,
  seedViewsSeries,
} from "./seed";

/**
 * Store en mémoire. Les mutations persistent le temps de la session
 * (rechargement de page = retour au seed). Aucun stockage réel.
 */
export interface Database {
  admin: Admin;
  sites: Site[];
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  comments: Comment[];
  media: MediaItem[];
  activity: ActivityLog[];
  viewsSeries: Record<string, { date: string; views: number }[]>;
  counter: number;
}

function createDatabase(): Database {
  return {
    admin: { ...seedAdmin },
    sites: seedSites.map((s) => ({ ...s })),
    posts: seedPosts.map((p) => ({ ...p, seo: { ...p.seo } })),
    categories: seedCategories.map((c) => ({ ...c })),
    tags: seedTags.map((t) => ({ ...t })),
    comments: seedComments.map((c) => ({ ...c })),
    media: seedMedia.map((m) => ({ ...m })),
    activity: seedActivity.map((a) => ({ ...a })),
    viewsSeries: Object.fromEntries(
      Object.entries(seedViewsSeries).map(([k, v]) => [k, v.map((p) => ({ ...p }))])
    ),
    counter: 1,
  };
}

// Survit au Fast Refresh en développement.
const globalStore = globalThis as unknown as { __lfcDb?: Database };
export const db: Database = globalStore.__lfcDb ?? createDatabase();
globalStore.__lfcDb = db;

/** Latence simulée, pour que le passage à une vraie API soit transparent. */
export function sleep(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Copie défensive : l'UI ne doit jamais muter le store directement. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}

export function nextId(prefix: string): string {
  db.counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${db.counter}`;
}

/** Journalise une action dans le flux d'activité. */
export function logActivity(siteId: string, action: string, target: string) {
  db.activity.unshift({
    id: nextId("activity"),
    siteId,
    userId: db.admin.id,
    action,
    target,
    timestamp: new Date().toISOString(),
  });
}

/** Recalcule les compteurs dérivés (postsCount, postCount). */
export function refreshCounters() {
  for (const site of db.sites) {
    site.postsCount = db.posts.filter((p) => p.siteId === site.id).length;
  }
  for (const category of db.categories) {
    category.postCount = db.posts.filter((p) =>
      p.categoryIds.includes(category.id)
    ).length;
  }
  for (const tag of db.tags) {
    tag.postCount = db.posts.filter((p) => p.tagIds.includes(tag.id)).length;
  }
}
