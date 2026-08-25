import { z } from "zod";

/**
 * Schémas Zod calqués sur la définition OpenAPI du backend
 * (`/v3/api-docs`). Toute réponse réseau est validée avant d'entrer dans
 * l'application : une dérive du contrat côté serveur est détectée ici,
 * pas trois écrans plus loin.
 */

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const authRequestSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(1, "Saisissez votre mot de passe."),
});
export type AuthRequest = z.infer<typeof authRequestSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const resetPasswordRequestSchema = z
  .object({
    email: z.email("Adresse e-mail invalide."),
    newPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordRequestSchema>;

/* -------------------------------------------------------------------------- */
/* Entreprises                                                                */
/* -------------------------------------------------------------------------- */

export const companySchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  // Le backend renvoie parfois la chaîne littérale "string" (données de test)
  // ou null : on normalise vers `null` pour ne jamais tenter de la charger.
  logoUrl: z
    .string()
    .nullish()
    .transform((value) =>
      !value || value === "string" || !/^https?:\/\//.test(value) ? null : value
    ),
});
export type Company = z.infer<typeof companySchema>;

export const companyListSchema = z.array(companySchema);

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom de l'entreprise est obligatoire."),
  code: z
    .string()
    .trim()
    .min(1, "Le code est obligatoire.")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Le code ne peut contenir que des lettres, chiffres, tirets et underscores."
    ),
  logoUrl: z.string().trim().optional(),
});
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
/* -------------------------------------------------------------------------- */

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
};

export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string().nullish().transform((v) => v ?? ""),
  excerpt: z.string().nullish().transform((v) => v ?? ""),
  coverImageUrl: z.string().nullish().transform((v) => v ?? null),
  status: postStatusSchema,
  company: companySchema.nullish().transform((v) => v ?? null),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullish().transform((v) => v ?? null),
});
export type Post = z.infer<typeof postSchema>;

/**
 * `GET /posts` renvoie un tableau brut : la pagination serveur a été retirée du
 * contrat. Le tri et le découpage en pages se font donc côté client.
 */
export const postListSchema = z.array(postSchema);

/**
 * Le backend attend `title`, `content`, `excerpt`… en **paramètres de requête**
 * et non dans le corps. L'URL complète doit rester sous la limite d'en-tête
 * HTTP de Tomcat (8 Ko), d'où le plafond sur le contenu, vérifié en conditions
 * réelles : 6 000 caractères passent, 8 000 renvoient une 400.
 */
export const MAX_CONTENT_LENGTH = 6000;

export const postFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire."),
  content: z
    .string()
    .trim()
    .min(1, "L'article ne peut pas être vide.")
    .max(
      MAX_CONTENT_LENGTH,
      `Le contenu dépasse ${MAX_CONTENT_LENGTH} caractères : l'API transmet l'article dans l'URL et le rejetterait.`
    ),
  excerpt: z.string().trim().optional(),
  status: postStatusSchema,
  companyId: z.number({ error: "Choisissez une entreprise." }).int().positive(),
  coverImageUrl: z.string().trim().optional(),
  /** Date de mise en ligne, désormais pilotable depuis le dashboard. */
  publishedAt: z.string().trim().optional(),
});
export type PostFormValues = z.infer<typeof postFormSchema>;

/* -------------------------------------------------------------------------- */
/* Statistiques                                                               */
/* -------------------------------------------------------------------------- */

export const companyPostCountSchema = z.object({
  companyName: z.string(),
  postCount: z.number(),
});

export const statsSchema = z.object({
  totalCompanies: z.number(),
  totalPosts: z.number(),
  totalPublishedPosts: z.number(),
  totalDraftPosts: z.number(),
  postsPerCompany: z.array(companyPostCountSchema).nullish().transform((v) => v ?? []),
});
export type Stats = z.infer<typeof statsSchema>;
