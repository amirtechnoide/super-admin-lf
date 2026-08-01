"use client";

import * as React from "react";
import type { ViewsPoint } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const LABEL_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

/**
 * Courbe des vues sur 30 jours. SVG maison, sans librairie de charts :
 * suffisant ici, et zéro poids supplémentaire dans le bundle.
 */
export function ViewsChart({
  points,
  className,
}: {
  points: ViewsPoint[];
  className?: string;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.views));
  const min = Math.min(...points.map((p) => p.views));
  const range = Math.max(1, max - min);

  // Espace de coordonnées normalisé : le SVG s'étire, les traits non.
  const coords = points.map((point, index) => ({
    x: (index / (points.length - 1)) * 100,
    y: 100 - ((point.views - min) / range) * 82 - 9,
  }));

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L100,100 L0,100 Z`;

  const active = hovered === null ? null : points[hovered];

  return (
    <div className={cn("relative", className)}>
      <div className="relative h-[180px] w-full sm:h-[200px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="size-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Lignes de repère : le blanc structure, pas les bordures. */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path d={area} fill="url(#views-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {hovered !== null ? (
            <>
              <line
                x1={coords[hovered].x}
                x2={coords[hovered].x}
                y1="0"
                y2="100"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={coords[hovered].x}
                cy={coords[hovered].y}
                r="3"
                fill="var(--accent)"
                stroke="var(--surface)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
        </svg>

        {/* Zones de survol — une colonne par jour. */}
        <div
          className="absolute inset-0 flex"
          onMouseLeave={() => setHovered(null)}
        >
          {points.map((point, index) => (
            <button
              key={point.date}
              type="button"
              tabIndex={-1}
              aria-hidden
              className="h-full flex-1"
              onMouseEnter={() => setHovered(index)}
            />
          ))}
        </div>

        {active ? (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-md"
            style={{
              left: `${Math.min(88, Math.max(12, coords[hovered!].x))}%`,
            }}
          >
            <p className="whitespace-nowrap font-mono text-[11px] text-muted">
              {LABEL_FMT.format(new Date(active.date))}
            </p>
            <p className="whitespace-nowrap text-[13px] font-medium tabular">
              {formatNumber(active.views)} vues
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
        <span>{LABEL_FMT.format(new Date(points[0].date))}</span>
        <span className="max-sm:hidden">
          {LABEL_FMT.format(
            new Date(points[Math.floor(points.length / 2)].date)
          )}
        </span>
        <span>{LABEL_FMT.format(new Date(points[points.length - 1].date))}</span>
      </div>
    </div>
  );
}
