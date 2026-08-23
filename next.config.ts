import type { NextConfig } from "next";

/**
 * Le relais vers le backend n'est pas un `rewrite` mais un route handler
 * (`app/api/backend/[...path]/route.ts`) : un rewrite retransmettrait
 * l'en-tête `Origin` du navigateur, que le backend rejette par un 403.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
