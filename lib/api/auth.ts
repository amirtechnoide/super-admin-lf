import { request } from "./client";
import {
  authResponseSchema,
  type AuthRequest,
  type AuthResponse,
} from "./schemas";
import { z } from "zod";

export async function login(credentials: AuthRequest): Promise<AuthResponse> {
  return request(authResponseSchema, {
    url: "/auth/login",
    method: "POST",
    data: credentials,
  });
}

export async function resetPassword(payload: {
  email: string;
  newPassword: string;
}): Promise<void> {
  await request(z.record(z.string(), z.string()), {
    url: "/auth/reset-password",
    method: "POST",
    data: payload,
  });
}
