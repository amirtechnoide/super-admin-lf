import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  /** Teinte la carte avec l'accent du site actif (KPI principal). */
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-xs transition-colors sm:p-5",
        highlight && "bg-accent-softer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-muted">{label}</p>
        <Icon
          className={cn("size-4 shrink-0", highlight ? "text-accent" : "text-muted")}
        />
      </div>
      <p className="mt-2.5 font-display text-2xl font-semibold tracking-tight tabular sm:text-[28px]">
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {typeof trend === "number" && trend !== 0 ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium tabular",
              trend > 0 ? "text-success" : "text-danger"
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {trend > 0 ? "+" : ""}
            {trend} %
          </span>
        ) : null}
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </div>
    </div>
  );
}
