"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
  type PostListParams,
  type PostPayload,
} from "@/lib/api/posts";
import { queryKeys } from "./keys";

/** Retourne tous les articles du périmètre : l'API ne pagine plus. */
export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => getPosts(params),
  });
}

export function usePost(id: number | null) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id ?? 0),
    queryFn: () => getPost(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

function usePostInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.stats });
  };
}

export function useCreatePost() {
  const invalidate = usePostInvalidation();
  return useMutation({
    mutationFn: (payload: PostPayload) => createPost(payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePost() {
  const invalidate = usePostInvalidation();
  return useMutation({
    mutationFn: ({ id, ...payload }: PostPayload & { id: number }) =>
      updatePost(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeletePost() {
  const invalidate = usePostInvalidation();
  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: invalidate,
  });
}
