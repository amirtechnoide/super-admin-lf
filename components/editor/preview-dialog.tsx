"use client";

import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Modale de rendu de l'article, telle qu'elle apparaîtrait sur le site. */
export function PreviewDialog({
  open,
  onOpenChange,
  title,
  excerpt,
  content,
  coverImage,
  readingTime,
  authorName,
  siteName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  readingTime: number;
  authorName: string;
  siteName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Aperçu de l&apos;article</DialogTitle>
          <p className="text-[13px] text-muted">
            Rendu approximatif sur {siteName}.
          </p>
        </DialogHeader>

        <DialogBody>
          <article className="mx-auto max-w-[38rem]">
            {coverImage ? (
              <div className="mb-5 flex aspect-[16/7] w-full items-center justify-center rounded-xl border border-border bg-surface-2">
                <span className="px-4 text-center font-mono text-[11px] text-muted">
                  {coverImage}
                </span>
              </div>
            ) : null}

            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
              {formatDate(new Date().toISOString())} · {readingTime} min de
              lecture
            </p>

            <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {title || "Titre de l'article"}
            </h1>

            {excerpt ? (
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {excerpt}
              </p>
            ) : null}

            <p className="mt-4 border-t border-border pt-4 text-[13px] text-muted">
              Par <span className="font-medium text-text">{authorName}</span>
            </p>

            <div
              className="article-render mt-5"
              // Contenu produit par l'éditeur Tiptap de ce même dashboard.
              dangerouslySetInnerHTML={{
                __html:
                  content ||
                  "<p>Le contenu de l'article apparaîtra ici.</p>",
              }}
            />
          </article>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
