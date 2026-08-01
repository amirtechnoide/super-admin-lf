import type { Tag } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { clone, db, logActivity, nextId, refreshCounters, sleep } from "./db";

export async function getTags(siteId: string | null): Promise<Tag[]> {
  await sleep(280);
  refreshCounters();
  const items = db.tags
    .filter((t) => (siteId ? t.siteId === siteId : true))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return clone(items);
}

export async function createTag(data: {
  siteId: string;
  name: string;
  slug?: string;
}): Promise<Tag> {
  await sleep(300);
  const tag: Tag = {
    id: nextId("tag"),
    siteId: data.siteId,
    name: data.name.trim(),
    slug: data.slug?.trim() || slugify(data.name),
    postCount: 0,
  };
  db.tags.push(tag);
  logActivity(data.siteId, "a créé le tag", tag.name);
  return clone(tag);
}

export async function updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
  await sleep(280);
  const index = db.tags.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Tag introuvable");
  db.tags[index] = { ...db.tags[index], ...data, id };
  return clone(db.tags[index]);
}

export async function deleteTag(id: string): Promise<void> {
  await sleep(280);
  const tag = db.tags.find((t) => t.id === id);
  db.tags = db.tags.filter((t) => t.id !== id);
  for (const post of db.posts) {
    post.tagIds = post.tagIds.filter((tid) => tid !== id);
  }
  refreshCounters();
  if (tag) logActivity(tag.siteId, "a supprimé le tag", tag.name);
}
