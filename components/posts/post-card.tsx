"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, CalendarDays, Clock } from "lucide-react";
import type { Post } from "@/lib/api/schemas";
import { accentForCompany } from "@/lib/theme/company-accent";
import {
  cn,
  estimateReadingTime,
  formatDateTime,
  isScheduledPost,
  postPublicationInfo,
} from "@/lib/utils";
import { PostStatusBadge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/layout/company-switcher";

/**
 * Zone média de la carte. Sans couverture, on affiche un monogramme de
 * l'entreprise sur un aplat teinté par sa couleur : une absence assumée, pas
 * une image cassée.
 */
function CardMedia({ post, accent }: { post: Post; accent: string }) {
  const [failed, setFailed] = React.useState(false);
  const hasImage = Boolean(post.coverImageUrl) && !failed;

  return (
    <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- domaine de stockage non déclaré */}
          <img
            src={post.coverImageUrl as string}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
          />
        </>
      ) : (
        <div
          className="flex size-full items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(135deg, ${accent}1f, ${accent}0d 55%, transparent)`,
          }}
        >
          {/* Trame discrète : la zone reste vivante sans devenir décorative. */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
              color: accent,
            }}
          />
          <span
            className="relative font-display text-4xl font-semibold tracking-tight"
            style={{ color: accent, opacity: 0.45 }}
          >
            {(post.company?.code ?? post.title).replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "SG"}
          </span>
        </div>
      )}

      {/* Filet de couleur : rattache visuellement la carte à son entreprise. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{ backgroundColor: accent }}
      />
    </div>
  );
}

/**
 * Carte d'article : média, entreprise, statut, titre et extrait tronqués, date
 * et temps de lecture. Toute la surface ouvre l'article.
 */
export function PostCard({
  post,
  showCompany,
  actions,
}: {
  post: Post;
  showCompany: boolean;
  actions?: React.ReactNode;
}) {
  const accent = accentForCompany(post.company);
  const readingTime = estimateReadingTime(post.content);
  const scheduled = isScheduledPost(post);
  const publication = postPublicationInfo(post);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs",
        "transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg",
        "focus-within:border-accent"
      )}
    >
      <CardMedia post={post} accent={accent} />

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          {showCompany && post.company ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <CompanyLogo
                company={post.company}
                className="size-5 rounded-md text-[9px]"
              />
              <span
                className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: accent }}
              >
                {post.company.name}
              </span>
            </span>
          ) : (
            <span className="font-mono text-[10px] text-muted">#{post.id}</span>
          )}
          <PostStatusBadge
            status={post.status}
            scheduled={scheduled}
            className="shrink-0"
          />
        </div>

        {/* Le lien couvre la carte : toute la surface est cliquable. */}
        <h3 className="font-display text-[15px] font-semibold leading-snug tracking-tight">
          <Link
            href={`/posts/${post.id}/edit`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            <span className="line-clamp-2 transition-colors group-hover:text-accent">
              {post.title}
            </span>
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {post.excerpt}
          </p>
        ) : (
          <p className="mt-1.5 truncate font-mono text-[11px] text-muted/70">
            /{post.slug}
          </p>
        )}

        {/* Un brouillon dormant n'annonce rien : seuls un article en ligne et un
            brouillon planifié ont une date à montrer. */}
        {publication ? (
          <p
            className={cn(
              "mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px]",
              publication.scheduled ? "text-info" : "text-muted"
            )}
          >
            <CalendarClock className="size-3 shrink-0" aria-hidden />
            <span className="truncate">
              {publication.scheduled ? "Planifié" : "Publié"} le{" "}
              {formatDateTime(publication.date)}
            </span>
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 font-mono text-[11px] text-muted">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <CalendarDays className="size-3 shrink-0" aria-hidden />
            <span className="truncate">
              Créé le {formatDateTime(post.createdAt)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3" />
            {readingTime} min
            <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        </div>
      </div>

      {/* Au-dessus du lien de couverture, sinon le menu serait inatteignable. */}
      {actions ? (
        <div className="absolute right-2 top-2 z-10">{actions}</div>
      ) : null}
    </article>
  );
}

/** Squelette calqué sur la carte, pour que le chargement ne fasse pas sauter la grille. */
export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="skeleton aspect-[16/9] w-full" />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="skeleton h-3 w-20 rounded-md" />
          <div className="skeleton h-5 w-16 rounded-md" />
        </div>
        <div className="skeleton h-4 w-[85%] rounded-md" />
        <div className="skeleton mt-2 h-3 w-full rounded-md" />
        <div className="skeleton mt-1.5 h-3 w-[55%] rounded-md" />
        <div className="skeleton mt-2.5 h-3 w-32 rounded-md" />
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton h-3 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}
