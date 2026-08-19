"use client";

import { use } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { usePost } from "@/lib/queries/use-posts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-state";
import { PostEditor } from "@/components/editor/post-editor";

export default function EditPostPage({
  params,
}: {
  // Next 16 : `params` est une Promise, lue ici avec `use`.
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postId = Number(id);
  const post = usePost(Number.isFinite(postId) ? postId : null);

  if (!Number.isFinite(postId)) {
    return (
      <Card>
        <EmptyState
          icon={FileQuestion}
          title="Identifiant d'article invalide"
          description="L'adresse ne correspond à aucun article."
          action={
            <Button asChild>
              <Link href="/posts">Revenir aux articles</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  if (post.isError) {
    return (
      <Card>
        <QueryError error={post.error} onRetry={() => post.refetch()} />
      </Card>
    );
  }

  if (post.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[420px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // `key` : repartir d'un état de formulaire propre quand on change d'article.
  return <PostEditor key={post.data.id} post={post.data} />;
}
