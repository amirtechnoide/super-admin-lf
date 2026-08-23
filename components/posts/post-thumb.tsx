"use client";

import * as React from "react";
import type { Post } from "@/lib/api/schemas";
import { accentForCompany } from "@/lib/theme/company-accent";
import { cn } from "@/lib/utils";

/**
 * Vignette carrée d'article pour les listes compactes : la couverture si elle
 * existe, sinon le monogramme de l'entreprise sur un aplat teinté.
 */
export function PostThumb({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const accent = accentForCompany(post.company);
  const monogram =
    (post.company?.code ?? post.title)
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 2)
      .toUpperCase() || "SG";

  if (post.coverImageUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- domaine de stockage non déclaré
      <img
        src={post.coverImageUrl}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "size-10 shrink-0 rounded-lg border border-border bg-surface-2 object-cover",
          className
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg border border-border font-display text-[11px] font-semibold",
        className
      )}
      style={{ backgroundColor: `${accent}1f`, color: accent }}
    >
      {monogram}
    </span>
  );
}
