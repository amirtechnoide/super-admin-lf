"use client";

import * as React from "react";
import { CalendarDays, Clock, ImageOff } from "lucide-react";
import { POST_STATUS_LABELS, type PostStatus } from "@/lib/api/schemas";
import { formatDate } from "@/lib/utils";
import { PostStatusBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Image de couverture, avec repli propre si l'URL ne charge pas. */
function CoverImage({ src }: { src: string }) {
  const [failed, setFailed] = React.useState(false);

  // Nouvelle source = nouvel essai de chargement, ajusté pendant le rendu.
  const [lastSrc, setLastSrc] = React.useState(src);
  if (lastSrc !== src) {
    setLastSrc(src);
    setFailed(false);
  }

  if (failed) {
    return (
      <div className="mb-6 flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-muted">
        <ImageOff className="size-5" />
        <span className="px-4 text-center font-mono text-[11px] break-all">
          {src}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- domaine de stockage non déclaré dans next.config
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="mb-6 aspect-[16/7] w-full rounded-xl border border-border bg-surface-2 object-cover"
    />
  );
}

/**
 * Aperçu de l'article tel qu'il se lirait sur le blog : couverture, entreprise,
 * titre, date et temps de lecture, chapô puis contenu.
 */
export function PreviewDialog({
  open,
  onOpenChange,
  title,
  excerpt,
  content,
  coverImage,
  readingTime,
  companyName,
  status,
  publishedAt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  readingTime: number;
  companyName: string;
  status: PostStatus;
  /** Date de mise en ligne saisie, sinon aujourd'hui à titre indicatif. */
  publishedAt?: string;
}) {
  const displayDate = publishedAt || new Date().toISOString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex-row items-center justify-between gap-3">
          <DialogTitle>Aperçu de l&apos;article</DialogTitle>
          <div className="flex shrink-0 items-center gap-2 pr-2">
            <PostStatusBadge status={status} />
          </div>
        </DialogHeader>

        <DialogBody className="bg-bg">
          <article className="mx-auto max-w-[40rem] py-2">
            {coverImage ? <CoverImage src={coverImage} /> : null}

            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
              {companyName}
            </p>

            <h1 className="font-display text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[34px]">
              {title || "Titre de l'article"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatDate(displayDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {readingTime} min de lecture
              </span>
              {status === "DRAFT" ? (
                <span className="text-warning">
                  {POST_STATUS_LABELS.DRAFT} — non visible sur le blog
                </span>
              ) : null}
            </div>

            {excerpt ? (
              <p className="mt-5 border-l-2 border-accent pl-4 text-[15px] leading-relaxed text-muted">
                {excerpt}
              </p>
            ) : null}

            <div
              className="article-render mt-6"
              // Contenu produit par l'éditeur Tiptap de ce même dashboard.
              dangerouslySetInnerHTML={{
                __html:
                  content || "<p>Le contenu de l'article apparaîtra ici.</p>",
              }}
            />
          </article>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
