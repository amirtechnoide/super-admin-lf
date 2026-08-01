import type { Comment, CommentStatus } from "@/lib/types";
import { clone, db, logActivity, sleep } from "./db";

export interface CommentFilters {
  siteId?: string | null;
  status?: CommentStatus | "all";
  query?: string;
}

export async function getComments({
  siteId,
  status,
  query,
}: CommentFilters = {}): Promise<Comment[]> {
  await sleep(300);
  const items = db.comments
    .filter((c) => (siteId ? c.siteId === siteId : true))
    .filter((c) => (status && status !== "all" ? c.status === status : true))
    .filter((c) => {
      if (!query) return true;
      const needle = query.trim().toLowerCase();
      return `${c.authorName} ${c.content}`.toLowerCase().includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return clone(items);
}

export async function getCommentCounts(
  siteId: string | null
): Promise<Record<CommentStatus, number>> {
  await sleep(200);
  const scoped = db.comments.filter((c) => (siteId ? c.siteId === siteId : true));
  return {
    pending: scoped.filter((c) => c.status === "pending").length,
    approved: scoped.filter((c) => c.status === "approved").length,
    spam: scoped.filter((c) => c.status === "spam").length,
  };
}

export async function moderateComment(
  id: string,
  status: CommentStatus
): Promise<Comment> {
  await sleep(300);
  const comment = db.comments.find((c) => c.id === id);
  if (!comment) throw new Error("Commentaire introuvable");
  comment.status = status;
  const verb =
    status === "approved"
      ? "a approuvé un commentaire de"
      : status === "spam"
        ? "a marqué comme spam un commentaire de"
        : "a remis en attente un commentaire de";
  logActivity(comment.siteId, verb, comment.authorName);
  return clone(comment);
}

export async function bulkModerateComments(
  ids: string[],
  status: CommentStatus
): Promise<void> {
  await sleep(400);
  for (const comment of db.comments) {
    if (ids.includes(comment.id)) comment.status = status;
  }
}

export async function deleteComment(id: string): Promise<void> {
  await sleep(280);
  db.comments = db.comments.filter((c) => c.id !== id);
}

export async function bulkDeleteComments(ids: string[]): Promise<void> {
  await sleep(400);
  db.comments = db.comments.filter((c) => !ids.includes(c.id));
}
