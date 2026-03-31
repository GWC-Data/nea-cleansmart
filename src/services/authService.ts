/**
 * authService.ts
 * All API calls related to authentication.
 * Uses the base URL from the typed env config.
 * In the future, replace fetch() with axios or a shared API client as needed.
 */

import { ENV } from "../config/env";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  UserProfile,
} from "../types/auth.types";

const BASE = ENV.API_BASE_URL;

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Creates a new user account.
 * Maps to: POST /users
 */
export const registerUser = async (
  payload: RegisterPayload
): Promise<UserProfile> => {
  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Registration failed. Please try again.");
  }

  return res.json() as Promise<UserProfile>;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticates an existing user and returns a JWT token.
 * Maps to: POST /auth/login  (update path once confirmed with backend)
 */
export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log(res);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Login failed. Check your credentials.");
  }

  return res.json() as Promise<AuthResponse>;
};
