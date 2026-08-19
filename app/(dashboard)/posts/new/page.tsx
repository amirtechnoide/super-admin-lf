"use client";

import { PostEditor } from "@/components/editor/post-editor";
import { useCompanies } from "@/lib/queries/use-companies";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { QueryError } from "@/components/ui/query-state";

export default function NewPostPage() {
  // L'éditeur a besoin de la liste des entreprises pour préremplir la cible.
  const companies = useCompanies();

  if (companies.isError) {
    return (
      <Card>
        <QueryError
          error={companies.error}
          onRetry={() => companies.refetch()}
        />
      </Card>
    );
  }

  if (companies.isPending) {
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

  return <PostEditor />;
}
