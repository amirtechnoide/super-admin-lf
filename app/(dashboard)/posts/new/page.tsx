"use client";

import { PostEditor } from "@/components/editor/post-editor";
import { useAppStore } from "@/lib/store/app-store";

export default function NewPostPage() {
  const sitesLoaded = useAppStore((s) => s.sitesLoaded);

  // On attend la liste des sites pour préremplir le site de destination.
  if (!sitesLoaded) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-surface-2" />
        <div className="h-[420px] w-full animate-pulse rounded-xl bg-surface-2" />
      </div>
    );
  }

  return <PostEditor />;
}
