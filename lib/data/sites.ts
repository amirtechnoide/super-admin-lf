import type { Site } from "@/lib/types";
import { clone, db, logActivity, nextId, refreshCounters, sleep } from "./db";

export async function getSites(): Promise<Site[]> {
  await sleep(300);
  refreshCounters();
  return clone(db.sites);
}

export async function getSite(id: string): Promise<Site | null> {
  await sleep(250);
  refreshCounters();
  const site = db.sites.find((s) => s.id === id);
  return site ? clone(site) : null;
}

export async function createSite(
  data: Omit<Site, "id" | "postsCount">
): Promise<Site> {
  await sleep(400);
  const site: Site = { ...data, id: nextId("site"), postsCount: 0 };
  db.sites.push(site);
  logActivity(site.id, "a ajouté le site", site.name);
  return clone(site);
}

export async function updateSite(
  id: string,
  data: Partial<Site>
): Promise<Site> {
  await sleep(400);
  const index = db.sites.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Site introuvable");
  db.sites[index] = { ...db.sites[index], ...data, id };
  logActivity(id, "a mis à jour les réglages du site", db.sites[index].name);
  return clone(db.sites[index]);
}

export async function deleteSite(id: string): Promise<void> {
  await sleep(350);
  db.sites = db.sites.filter((s) => s.id !== id);
  db.posts = db.posts.filter((p) => p.siteId !== id);
  db.categories = db.categories.filter((c) => c.siteId !== id);
  db.tags = db.tags.filter((t) => t.siteId !== id);
  db.comments = db.comments.filter((c) => c.siteId !== id);
  db.media = db.media.filter((m) => m.siteId !== id);
}
