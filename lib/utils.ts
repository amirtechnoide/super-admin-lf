import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Le backend sérialise des `LocalDateTime` **sans fuseau**
 * (ex. `2026-08-12T17:33:12.411428`). JavaScript interprète alors la valeur
 * dans le fuseau du navigateur : un admin hors du Cameroun verrait toutes les
 * dates décalées. On force donc le fuseau du serveur, qui n'a pas d'heure d'été.
 *
 * À retirer le jour où l'API renverra un instant complet (suffixe `Z` ou
 * décalage explicite) : la fonction le détecte déjà et le respecte.
 */
const SERVER_UTC_OFFSET = "+01:00"; // Africa/Douala, sans changement d'heure

export function parseApiDate(value: string): Date {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasTimezone ? value : `${value}${SERVER_UTC_OFFSET}`);
}

/**
 * `publishedAt` circule en `LocalDateTime` nu dans les deux sens. On le
 * manipule donc **tel quel**, par découpage de chaîne : l'admin voit et saisit
 * exactement l'heure que le serveur stockera, sans conversion susceptible de
 * décaler la valeur à chaque aller-retour.
 */
export function toDatetimeLocal(serverDateTime?: string | null): string {
  if (!serverDateTime) return "";
  return serverDateTime.slice(0, 16);
}

export function fromDatetimeLocal(value: string): string | undefined {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return DATE_FMT.format(parseApiDate(iso));
}

/** « il y a 3 jours », sans dépendance de locale supplémentaire. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - parseApiDate(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.round(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return `il y a ${Math.round(months / 12)} an(s)`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Temps de lecture approximatif, en minutes (200 mots/min). */
export function estimateReadingTime(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Noir ou blanc selon la luminance, pour du texte posé sur l'accent. */
export function contrastOn(hex: string): "#ffffff" | "#17171a" {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.45 ? "#17171a" : "#ffffff";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
