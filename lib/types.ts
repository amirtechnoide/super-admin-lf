export type PostStatus = "draft" | "scheduled" | "published" | "archived";
export type CommentStatus = "pending" | "approved" | "spam";

export interface Site {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  accentColor: string;
  locale: "fr" | "en";
  timezone: string;
  status: "active" | "suspended";
  postsCount: number;
}

/** L'utilisateur unique du dashboard. Un seul rôle : admin. */
export interface Admin {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  status: PostStatus;
  categoryIds: string[];
  tagIds: string[];
  authorId: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  views: number;
  seo: { metaTitle: string; metaDescription: string; ogImage?: string };
}

export interface Category {
  id: string;
  siteId: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
}

export interface Tag {
  id: string;
  siteId: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  siteId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  siteId: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  siteId: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}

/* --------------------------------------------------------------------------
   Types utilitaires de la couche de données
-------------------------------------------------------------------------- */

/** `null` = « Tous les sites » (vue agrégée). */
export type SiteScope = string | null;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PostFilters {
  siteId?: SiteScope;
  status?: PostStatus | "all";
  categoryId?: string;
  authorId?: string;
  query?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface OverviewStats {
  published: number;
  drafts: number;
  monthlyViews: number;
  pendingComments: number;
  /** Variation en % vs période précédente, pour la carte KPI. */
  viewsTrend: number;
}

export interface ViewsPoint {
  date: string;
  views: number;
}

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Brouillon",
  scheduled: "Planifié",
  published: "Publié",
  archived: "Archivé",
};

export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  pending: "En attente",
  approved: "Approuvé",
  spam: "Spam",
};

export const SITE_STATUS_LABELS: Record<Site["status"], string> = {
  active: "Actif",
  suspended: "Suspendu",
};
