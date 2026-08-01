// 🔌 Point de branchement API : remplacer le corps de ces fonctions par des fetch réels.
//
// Toute l'UI passe par ce module — aucun composant ne fait de `fetch` en dur.
// Chaque fonction est asynchrone et retourne une Promise : le jour où vous
// branchez votre backend, seules les implémentations de `lib/data/*.ts`
// changent, les signatures et les écrans restent identiques.

export * from "./sites";
export * from "./posts";
export * from "./categories";
export * from "./tags";
export * from "./comments";
export * from "./media";
export * from "./activity";
export * from "./admin";
