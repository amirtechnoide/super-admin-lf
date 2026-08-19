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
  companyName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  readingTime: number;
  companyName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Aperçu de l&apos;article</DialogTitle>
          <p className="text-[13px] text-muted">
            Rendu approximatif sur le blog {companyName}.
          </p>
        </DialogHeader>

        <DialogBody>
          <article className="mx-auto max-w-[38rem]">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- domaine R2 non declare
              <img
                src={coverImage}
                alt=""
                className="mb-5 aspect-[16/7] w-full rounded-xl border border-border bg-surface-2 object-cover"
              />
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
