"use client";

import { use } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getPost } from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PostEditor } from "@/components/editor/post-editor";

export default function EditPostPage({
  params,
}: {
  // Next 16 : `params` est une Promise, lue ici avec `use`.
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const post = useAsync(() => getPost(id), [id]);

  if (post.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Skeleton className="h-[168px] w-full rounded-xl" />
            <Skeleton className="h-[420px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!post.data) {
    return (
      <Card>
        <EmptyState
          icon={FileQuestion}
          title="Cet article n'existe plus"
          description="Il a peut-être été supprimé depuis un autre écran."
          action={
            <Button asChild>
              <Link href="/posts">Revenir aux articles</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return <PostEditor post={post.data} />;
}
