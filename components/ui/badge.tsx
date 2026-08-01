import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  COMMENT_STATUS_LABELS,
  POST_STATUS_LABELS,
  SITE_STATUS_LABELS,
  type CommentStatus,
  type PostStatus,
  type Site,
} from "@/lib/types";

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

/* Badges de statut réutilisables ------------------------------------------- */

const POST_TONES: Record<PostStatus, VariantProps<typeof badgeVariants>["tone"]> =
  {
    published: "accent",
    draft: "neutral",
    scheduled: "info",
    archived: "warning",
  };

export function PostStatusBadge({
  status,
  className,
}: {
  status: PostStatus;
  className?: string;
}) {
  return (
    <Badge tone={POST_TONES[status]} className={className}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "published" && "bg-accent",
          status === "draft" && "bg-muted",
          status === "scheduled" && "bg-info",
          status === "archived" && "bg-warning"
        )}
      />
      {POST_STATUS_LABELS[status]}
    </Badge>
  );
}

const COMMENT_TONES: Record<
  CommentStatus,
  VariantProps<typeof badgeVariants>["tone"]
> = {
  pending: "warning",
  approved: "success",
  spam: "danger",
};

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  return (
    <Badge tone={COMMENT_TONES[status]}>{COMMENT_STATUS_LABELS[status]}</Badge>
  );
}

export function SiteStatusBadge({ status }: { status: Site["status"] }) {
  return (
    <Badge tone={status === "active" ? "success" : "warning"}>
      {SITE_STATUS_LABELS[status]}
    </Badge>
  );
}
