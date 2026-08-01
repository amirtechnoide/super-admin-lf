import type { MediaItem } from "@/lib/types";
import { clone, db, logActivity, nextId, sleep } from "./db";

export async function getMedia({
  siteId,
  query,
}: {
  siteId?: string | null;
  query?: string;
} = {}): Promise<MediaItem[]> {
  await sleep(300);
  const items = db.media
    .filter((m) => (siteId ? m.siteId === siteId : true))
    .filter((m) =>
      query ? m.name.toLowerCase().includes(query.trim().toLowerCase()) : true
    )
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return clone(items);
}

/**
 * Téléversement simulé : aucun fichier n'est stocké, on enregistre seulement
 * les métadonnées. À remplacer par un vrai upload (S3, Cloudinary…).
 */
export async function uploadMedia(data: {
  siteId: string;
  name: string;
  type: string;
  size: number;
}): Promise<MediaItem> {
  await sleep(700);
  const item: MediaItem = {
    id: nextId("media"),
    siteId: data.siteId,
    url: `/media/${data.siteId}/${data.name}`,
    name: data.name,
    type: data.type,
    size: data.size,
    uploadedAt: new Date().toISOString(),
  };
  db.media.unshift(item);
  logActivity(data.siteId, "a téléversé le média", item.name);
  return clone(item);
}

export async function deleteMedia(id: string): Promise<void> {
  await sleep(300);
  db.media = db.media.filter((m) => m.id !== id);
}

export async function bulkDeleteMedia(ids: string[]): Promise<void> {
  await sleep(400);
  db.media = db.media.filter((m) => !ids.includes(m.id));
}
