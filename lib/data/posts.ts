import type { Paginated, Post, PostFilters, PostStatus } from "@/lib/types";
import { estimateReadingTime, slugify } from "@/lib/utils";
import { clone, db, logActivity, nextId, refreshCounters, sleep } from "./db";

function matches(post: Post, filters: PostFilters): boolean {
  const { siteId, status, categoryId, authorId, query, from, to } = filters;

  // siteId undefined ou null => toutes les données (vue agrégée).
  if (siteId && post.siteId !== siteId) return false;
  if (status && status !== "all" && post.status !== status) return false;
  if (categoryId && !post.categoryIds.includes(categoryId)) return false;
  if (authorId && post.authorId !== authorId) return false;

  if (query) {
    const needle = query.trim().toLowerCase();
    const haystack = `${post.title} ${post.excerpt} ${post.slug}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  const reference = post.publishedAt ?? post.createdAt;
  if (from && reference < from) return false;
  if (to && reference > to) return false;

  return true;
}

export async function getPosts(
  filters: PostFilters = {}
): Promise<Paginated<Post>> {
  await sleep(320);
  const { page = 1, pageSize = 10 } = filters;
  const all = db.posts
    .filter((post) => matches(post, filters))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const start = (page - 1) * pageSize;
  return {
    items: clone(all.slice(start, start + pageSize)),
    total: all.length,
    page,
    pageSize,
  };
}

/** Sans pagination — pour l'overview et la recherche globale. */
export async function getRecentPosts(
  siteId: string | null,
  limit = 5
): Promise<Post[]> {
  await sleep(280);
  const all = db.posts
    .filter((post) => (siteId ? post.siteId === siteId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return clone(all.slice(0, limit));
}

export async function getPost(id: string): Promise<Post | null> {
  await sleep(280);
  const post = db.posts.find((p) => p.id === id);
  return post ? clone(post) : null;
}

export type PostDraft = Partial<Omit<Post, "id">> & { siteId: string };

export async function createPost(data: PostDraft): Promise<Post> {
  await sleep(420);
  const now = new Date().toISOString();
  const title = data.title?.trim() || "Article sans titre";
  const content = data.content ?? "";

  const post: Post = {
    id: nextId("post"),
    siteId: data.siteId,
    title,
    slug: data.slug?.trim() || slugify(title),
    excerpt: data.excerpt ?? "",
    content,
    coverImage: data.coverImage,
    status: data.status ?? "draft",
    categoryIds: data.categoryIds ?? [],
    tagIds: data.tagIds ?? [],
    authorId: data.authorId ?? db.admin.id,
    publishedAt:
      data.publishedAt ?? (data.status === "published" ? now : undefined),
    scheduledAt: data.scheduledAt,
    createdAt: now,
    updatedAt: now,
    readingTime: estimateReadingTime(content),
    views: 0,
    seo: {
      metaTitle: data.seo?.metaTitle ?? title,
      metaDescription: data.seo?.metaDescription ?? data.excerpt ?? "",
      ogImage: data.seo?.ogImage,
    },
  };

  db.posts.unshift(post);
  refreshCounters();
  logActivity(
    post.siteId,
    post.status === "published" ? "a publié l'article" : "a créé l'article",
    post.title
  );
  return clone(post);
}

export async function updatePost(
  id: string,
  data: Partial<Post>
): Promise<Post> {
  await sleep(420);
  const index = db.posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Article introuvable");

  const previous = db.posts[index];
  const merged: Post = {
    ...previous,
    ...data,
    id,
    seo: { ...previous.seo, ...(data.seo ?? {}) },
    updatedAt: new Date().toISOString(),
  };

  if (data.content !== undefined) {
    merged.readingTime = estimateReadingTime(data.content);
  }
  if (data.status === "published" && !merged.publishedAt) {
    merged.publishedAt = new Date().toISOString();
  }
  // Une date de planification n'a de sens que pour un article planifié.
  if (data.status && data.status !== "scheduled") {
    merged.scheduledAt = undefined;
  }

  db.posts[index] = merged;
  refreshCounters();
  logActivity(merged.siteId, "a modifié l'article", merged.title);
  return clone(merged);
}

export async function deletePost(id: string): Promise<void> {
  await sleep(320);
  const post = db.posts.find((p) => p.id === id);
  db.posts = db.posts.filter((p) => p.id !== id);
  db.comments = db.comments.filter((c) => c.postId !== id);
  refreshCounters();
  if (post) logActivity(post.siteId, "a supprimé l'article", post.title);
}

/* Actions groupées ---------------------------------------------------------- */

export async function bulkUpdatePostStatus(
  ids: string[],
  status: PostStatus
): Promise<void> {
  await sleep(450);
  const now = new Date().toISOString();
  for (const id of ids) {
    const post = db.posts.find((p) => p.id === id);
    if (!post) continue;
    post.status = status;
    post.updatedAt = now;
    if (status === "published" && !post.publishedAt) post.publishedAt = now;
    if (status !== "scheduled") post.scheduledAt = undefined;
  }
  refreshCounters();
}

export async function bulkDeletePosts(ids: string[]): Promise<void> {
  await sleep(450);
  db.posts = db.posts.filter((p) => !ids.includes(p.id));
  db.comments = db.comments.filter((c) => !ids.includes(c.postId));
  refreshCounters();
}
