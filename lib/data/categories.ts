import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { clone, db, logActivity, nextId, refreshCounters, sleep } from "./db";

export async function getCategories(siteId: string | null): Promise<Category[]> {
  await sleep(280);
  refreshCounters();
  const items = db.categories
    .filter((c) => (siteId ? c.siteId === siteId : true))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return clone(items);
}

export async function createCategory(data: {
  siteId: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}): Promise<Category> {
  await sleep(320);
  const category: Category = {
    id: nextId("cat"),
    siteId: data.siteId,
    name: data.name.trim(),
    slug: data.slug?.trim() || slugify(data.name),
    description: data.description,
    color: data.color,
    postCount: 0,
  };
  db.categories.push(category);
  logActivity(data.siteId, "a créé la catégorie", category.name);
  return clone(category);
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  await sleep(300);
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Catégorie introuvable");
  db.categories[index] = { ...db.categories[index], ...data, id };
  logActivity(
    db.categories[index].siteId,
    "a modifié la catégorie",
    db.categories[index].name
  );
  return clone(db.categories[index]);
}

export async function deleteCategory(id: string): Promise<void> {
  await sleep(300);
  const category = db.categories.find((c) => c.id === id);
  db.categories = db.categories.filter((c) => c.id !== id);
  // Les articles conservent leurs autres catégories.
  for (const post of db.posts) {
    post.categoryIds = post.categoryIds.filter((cid) => cid !== id);
  }
  refreshCounters();
  if (category)
    logActivity(category.siteId, "a supprimé la catégorie", category.name);
}
