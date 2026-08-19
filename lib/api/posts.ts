import { buildMultipartBody, request, requestVoid } from "./client";
import {
  pagePostSchema,
  postSchema,
  type PagePost,
  type Post,
  type PostFormValues,
  type PostStatus,
} from "./schemas";

export interface PostListParams {
  companyId?: number | null;
  status?: PostStatus | null;
  page?: number;
  size?: number;
  /** Format Spring Data, ex. `createdAt,desc`. */
  sort?: string;
}

export async function getPosts({
  companyId,
  status,
  page = 0,
  size = 10,
  sort = "createdAt,desc",
}: PostListParams = {}): Promise<PagePost> {
  return request(pagePostSchema, {
    url: "/posts",
    method: "GET",
    params: {
      page,
      size,
      sort,
      ...(companyId ? { companyId } : {}),
      ...(status ? { status } : {}),
    },
  });
}

export async function getPost(id: number): Promise<Post> {
  return request(postSchema, { url: `/posts/${id}`, method: "GET" });
}

export async function getPostBySlug(slug: string): Promise<Post> {
  return request(postSchema, { url: `/posts/slug/${slug}`, method: "GET" });
}

export interface PostPayload extends PostFormValues {
  coverImage?: File | null;
}

/**
 * Le backend lit les champs de l'article dans la query string et n'accepte que
 * le fichier de couverture dans le corps multipart.
 */
function toQueryParams(values: PostFormValues) {
  return {
    title: values.title,
    content: values.content,
    status: values.status,
    companyId: values.companyId,
    ...(values.excerpt ? { excerpt: values.excerpt } : {}),
    ...(values.coverImageUrl ? { coverImageUrl: values.coverImageUrl } : {}),
  };
}

export async function createPost({
  coverImage,
  ...values
}: PostPayload): Promise<Post> {
  return request(postSchema, {
    url: "/posts",
    method: "POST",
    params: toQueryParams(values),
    data: buildMultipartBody("coverImage", coverImage),
  });
}

export async function updatePost(
  id: number,
  { coverImage, ...values }: PostPayload
): Promise<Post> {
  return request(postSchema, {
    url: `/posts/${id}`,
    method: "PUT",
    params: toQueryParams(values),
    data: buildMultipartBody("coverImage", coverImage),
  });
}

export async function deletePost(id: number): Promise<void> {
  return requestVoid({ url: `/posts/${id}`, method: "DELETE" });
}
