"use client";

import { Check } from "lucide-react";
import { cn, contrastOn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const PRESETS = [
  "#2563EB",
  "#0E9AA7",
  "#4D7C2F",
  "#7C5CFF",
  "#D4483B",
  "#A3620A",
  "#B8336A",
  "#17171A",
];

/** Sélecteur de couleur d'accent, avec aperçu live sur un mini-composant. */
export function AccentPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Label>Couleur d&apos;accent</Label>

      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={`Accent ${color}`}
            aria-pressed={value.toLowerCase() === color.toLowerCase()}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border border-black/10 transition-transform hover:scale-105"
            )}
            style={{ backgroundColor: color }}
          >
            {value.toLowerCase() === color.toLowerCase() ? (
              <Check
                className="size-4"
                strokeWidth={3}
                style={{ color: contrastOn(color) }}
              />
            ) : null}
          </button>
        ))}

        <label className="relative flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2 text-[10px] font-medium text-muted">
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Couleur personnalisée"
          />
          +
        </label>
      </div>

      {/* Aperçu live : ce que la couleur donne dans l'interface. */}
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-muted">
          Aperçu
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium"
            style={{ backgroundColor: value, color: contrastOn(value) }}
          >
            Publier
          </span>
          <span
            className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium"
            style={{ backgroundColor: `${value}1f`, color: value }}
          >
            Publié
          </span>
          <span className="font-mono text-xs uppercase text-muted">{value}</span>
        </div>
      </div>
    </div>
  );
}
