import type { PostListParams } from "@/lib/api/posts";

/** Fabrique de clés de cache — une seule source de vérité pour l'invalidation. */
export const queryKeys = {
  companies: {
    all: ["companies"] as const,
    list: () => [...queryKeys.companies.all, "list"] as const,
    detail: (id: number) => [...queryKeys.companies.all, "detail", id] as const,
  },
  posts: {
    all: ["posts"] as const,
    list: (params: PostListParams) =>
      [...queryKeys.posts.all, "list", params] as const,
    detail: (id: number) => [...queryKeys.posts.all, "detail", id] as const,
  },
  stats: ["stats"] as const,
};
