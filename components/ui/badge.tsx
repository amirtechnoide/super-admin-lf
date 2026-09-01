import * as React from "react";
import { CalendarClock } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { POST_STATUS_LABELS, type PostStatus } from "@/lib/api/schemas";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap border",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-muted border-border",
        accent: "bg-accent-soft text-accent border-transparent",
        success:
          "bg-success/10 text-success border-success/20 dark:bg-success/15",
        warning:
          "bg-warning/10 text-warning border-warning/20 dark:bg-warning/15",
        danger: "bg-danger/10 text-danger border-danger/20 dark:bg-danger/15",
        info: "bg-info/10 text-info border-info/20 dark:bg-info/15",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/**
 * Badge de statut d'article, l'API n'expose que DRAFT et PUBLISHED.
 * Le vert dit « en ligne », l'ambre « pas encore » : la couleur porte
 * l'information, indépendamment de l'accent de l'entreprise.
 *
 * Un article planifié est publié au sens de l'API, mais sa date de mise en
 * ligne n'est pas encore atteinte. Le dire « Publié » serait faux : il reçoit
 * donc son propre badge, en bleu, pour ne pas se confondre avec ce qui est
 * réellement en ligne.
 */
export function PostStatusBadge({
  status,
  scheduled = false,
  className,
}: {
  status: PostStatus;
  scheduled?: boolean;
  className?: string;
}) {
  if (scheduled) {
    return (
      <Badge tone="info" className={className}>
        <CalendarClock className="size-3" aria-hidden />
        Planifié
      </Badge>
    );
  }

  const published = status === "PUBLISHED";
  return (
    <Badge tone={published ? "success" : "warning"} className={className}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          published ? "bg-success" : "bg-warning"
        )}
      />
      {POST_STATUS_LABELS[status]}
    </Badge>
  );
}
