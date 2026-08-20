import type { NextConfig } from "next";

/**
 * Le backend n'envoie aucun en-tête `Access-Control-Allow-Origin` : le
 * navigateur bloque donc tout appel direct depuis le dashboard. En attendant
 * que le CORS soit configuré côté serveur, on relaie les requêtes via Next :
 * le navigateur ne parle qu'à sa propre origine, et le serveur Next transmet
 * au backend — un échange serveur à serveur, où le CORS ne s'applique pas.
 *
 * Pour appeler le backend en direct (CORS configuré), il suffit de pointer
 * `NEXT_PUBLIC_API_BASE_URL` sur son URL absolue : le proxy n'est alors plus
 * sollicité.
 */
const proxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!proxyTarget) return [];
    return [
      {
        source: "/api/backend/:path*",
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
