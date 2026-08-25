import axios from "axios";
import { ZodError } from "zod";

/** Erreur normalisée : un message en français, affichable tel quel. */
export class ApiError extends Error {
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}

interface BackendError {
  error?: string;
  message?: string;
  status?: number;
}

/**
 * Traduit toute erreur (réseau, HTTP, validation Zod) en `ApiError` avec un
 * message qui dit quoi corriger, sans jargon technique.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(
      "La réponse du serveur ne correspond pas au format attendu. Le contrat de l'API a peut-être changé.",
      undefined,
      error
    );
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as BackendError | undefined;
    const backendMessage =
      typeof payload?.message === "string" && payload.message.trim()
        ? payload.message
        : undefined;

    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      return new ApiError(
        "Serveur injoignable. Vérifiez votre connexion et que le backend est démarré.",
        status,
        error
      );
    }

    switch (status) {
      case 400:
        return new ApiError(
          backendMessage ??
            "Requête refusée par le serveur. Vérifiez les champs saisis, un contenu trop long est la cause la plus fréquente.",
          status,
          error
        );
      case 401:
      case 403:
        return new ApiError(
          backendMessage ?? "Session expirée. Reconnectez-vous pour continuer.",
          status,
          error
        );
      case 404:
        return new ApiError(
          backendMessage ?? "Cette ressource n'existe pas ou a été supprimée.",
          status,
          error
        );
      case 409:
        return new ApiError(
          backendMessage ?? "Cette valeur est déjà utilisée. Choisissez-en une autre.",
          status,
          error
        );
      case 413:
        return new ApiError(
          "Le fichier est trop volumineux pour le serveur.",
          status,
          error
        );
      case 415:
        return new ApiError(
          "Format de requête refusé par le serveur.",
          status,
          error
        );
      default:
        if (status && status >= 500) {
          return new ApiError(
            "Le serveur a rencontré une erreur. Réessayez dans un instant.",
            status,
            error
          );
        }
        return new ApiError(
          backendMessage ?? "La requête a échoué.",
          status,
          error
        );
    }
  }

  return new ApiError(
    error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
    undefined,
    error
  );
}
