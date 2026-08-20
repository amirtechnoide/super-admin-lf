import { buildMultipartBody, request, requestVoid } from "./client";
import {
  postListSchema,
  postSchema,
  type Post,
  type PostFormValues,
  type PostStatus,
} from "./schemas";

export interface PostListParams {
  companyId?: number | null;
  status?: PostStatus | null;
}

/**
 * `GET /posts` ne pagine plus et ne trie plus : il renvoie l'intégralité des
 * articles du périmètre demandé. On impose donc un ordre stable ici — le plus
 * récent d'abord — pour que l'affichage ne dépende pas de l'ordre de la base.
 */
export async function getPosts({
  companyId,
  status,
}: PostListParams = {}): Promise<Post[]> {
  const posts = await request(postListSchema, {
    url: "/posts",
    method: "GET",
    params: {
      ...(companyId ? { companyId } : {}),
      ...(status ? { status } : {}),
    },
  });

  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    ...(values.publishedAt ? { publishedAt: values.publishedAt } : {}),
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
