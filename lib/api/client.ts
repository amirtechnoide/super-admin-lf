import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { z } from "zod";
import { authStorage } from "@/lib/auth/auth-store";
import { authResponseSchema } from "./schemas";
import { toApiError } from "./errors";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

if (!API_BASE_URL && typeof window !== "undefined") {
  console.error(
    "NEXT_PUBLIC_API_BASE_URL n'est pas défini : copiez .env.example vers .env.local."
  );
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    // Neutralise la page d'avertissement de localtunnel, sans effet ailleurs.
    "bypass-tunnel-reminder": "true",
  },
});

/** Routes publiques : ni jeton, ni tentative de rafraîchissement. */
const PUBLIC_PATHS = ["/auth/login", "/auth/refresh", "/auth/reset-password"];

function isPublicPath(url = "") {
  return PUBLIC_PATHS.some((path) => url.startsWith(path));
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isPublicPath(config.url)) {
    const token = authStorage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -------------------------------------------------------------------------- */
/* Rafraîchissement du jeton                                                  */
/*                                                                            */
/* Le jeton d'accès expire au bout de 15 minutes et le backend fait tourner le */
/* refresh token à chaque appel : deux requêtes concurrentes qui rafraîchissent */
/* en parallèle invalideraient l'une l'autre. D'où la promesse partagée.        */
/* -------------------------------------------------------------------------- */

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("Aucun refresh token disponible.");

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { "bypass-tunnel-reminder": "true" }, timeout: 30_000 }
  );

  const session = authResponseSchema.parse(response.data);
  authStorage.setSession(session.token, session.refreshToken);
  return session.token;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(toApiError(error));
    }

    const config = error.config as RetriableConfig;
    const status = error.response?.status;
    // Spring Security renvoie 403 (et non 401) quand le jeton manque ou a expiré.
    const isAuthFailure = status === 401 || status === 403;

    if (!isAuthFailure || config._retried || isPublicPath(config.url)) {
      return Promise.reject(toApiError(error));
    }

    config._retried = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;

      config.headers.Authorization = `Bearer ${token}`;
      return await http.request(config);
    } catch (refreshError) {
      refreshPromise = null;
      authStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(
        toApiError(refreshError instanceof Error ? error : refreshError)
      );
    }
  }
);

/** Appel validé par un schéma Zod : rien n'entre dans l'app sans contrôle. */
export async function request<T>(
  schema: z.ZodType<T>,
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await http.request(config);
    return schema.parse(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

/** Variante sans corps de réponse (DELETE renvoie 204). */
export async function requestVoid(config: AxiosRequestConfig): Promise<void> {
  try {
    await http.request(config);
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Le backend attend les champs en query params et un corps multipart pour le
 * fichier. Il refuse une requête sans corps (415) : on envoie donc toujours un
 * `FormData`, vide si aucun fichier n'est joint.
 */
export function buildMultipartBody(
  field: string,
  file?: File | null
): FormData {
  const body = new FormData();
  if (file) body.append(field, file);
  return body;
}
