import * as React from "react";
import { cn } from "@/lib/utils";

/** Écran vide rédigé : une phrase qui invite à agir + une action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-2">
          <Icon className="size-5 text-muted" />
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-medium text-text">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
