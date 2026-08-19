/**
 * L'API ne stocke aucune couleur par entreprise. Plutôt que d'inventer une
 * donnée côté serveur, l'accent est **dérivé de façon déterministe** du code de
 * l'entreprise : même entreprise = toujours la même couleur, sur tous les
 * postes, sans persistance. C'est un choix de présentation, pas une donnée.
 */
const PALETTE = [
  "#2563EB",
  "#0E9AA7",
  "#4D7C2F",
  "#7C5CFF",
  "#D4483B",
  "#A3620A",
  "#B8336A",
  "#1F6F5C",
];

/** Accent neutre : vue « Toutes les entreprises », ou aucune sélection. */
export const NEUTRAL_ACCENT = "#52525B";

export function accentForCompany(
  company?: { id: number; code: string } | null
): string {
  if (!company) return NEUTRAL_ACCENT;
  const seed = `${company.code}${company.id}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
