/**
 * L'API ne stocke aucune couleur par entreprise. L'accent est donc résolu
 * côté dashboard, en deux temps : la couleur de marque si le code est connu,
 * sinon une teinte **dérivée de façon déterministe** du code. Dans les deux
 * cas, même entreprise = même couleur sur tous les postes, sans persistance.
 * C'est un choix de présentation, pas une donnée.
 */

/**
 * Les quatre entreprises fondatrices et leur couleur officielle. Le code est
 * la seule clé de correspondance : recréées en production (après un vidage de
 * la base, par exemple), elles ne retrouvent leur couleur qu'à condition
 * d'être saisies avec exactement ce code. Un code inconnu retombe sur la
 * palette dérivée ci-dessous.
 *
 * Cette liste est aussi affichée telle quelle dans les Paramètres, pour que la
 * personne qui recrée les entreprises ait les codes sous les yeux.
 */
export const REFERENCE_COMPANIES = [
  { code: "camci_cm", name: "CAMCI", accent: "#3F2683" },
  { code: "tmc_cm", name: "TMC", accent: "#D12125" },
  { code: "fiagsa_sa", name: "FIAGSA", accent: "#EB580C" },
  { code: "itac_parts", name: "ITAC PARTS", accent: "#F68A1E" },
] as const;

const BRAND_ACCENTS: Record<string, string> = Object.fromEntries(
  REFERENCE_COMPANIES.map(({ code, accent }) => [code, accent])
);

/** Le code tel qu'il sert de clé : insensible à la casse et aux espaces. */
function accentKey(code: string): string {
  return code.trim().toLowerCase();
}

/** Vrai si l'entreprise porte une couleur de marque, et non une teinte dérivée. */
export function hasBrandAccent(
  company?: { code: string } | null
): boolean {
  return Boolean(company && accentKey(company.code) in BRAND_ACCENTS);
}

/** Teintes de repli, pour toute entreprise ajoutée hors des quatre fondatrices. */
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

/** Accent par défaut : vue « Toutes les entreprises », ou aucune sélection. */
export const NEUTRAL_ACCENT = "#0095DA";

export function accentForCompany(
  company?: { id: number; code: string } | null
): string {
  if (!company) return NEUTRAL_ACCENT;

  const brand = BRAND_ACCENTS[accentKey(company.code)];
  if (brand) return brand;

  const seed = `${company.code}${company.id}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
