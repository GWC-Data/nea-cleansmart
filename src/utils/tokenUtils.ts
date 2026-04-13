/**
 * tokenUtils.ts
 * Helper functions for managing the JWT access token in localStorage.
 * Token is the only auth-related data stored locally.
 * User profile data is fetched dynamically from the backend.
 */

const TOKEN_KEY = "nea_access_token";
const TOKEN_EXPIRY_KEY = "nea_token_expiry";

// import type { UserProfile } from "../types/auth.types";

/** Persist the JWT token after a successful login */
export const saveToken = (token: string, expiry?: number): void => {
  localStorage.setItem(TOKEN_KEY, token);
  if (expiry) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  }
};

/** Retrieve the stored JWT token, or null if not present */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/** Remove the JWT token (used on logout) */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/** Remove all auth-related data (full logout) */
export const clearAuthData = (): void => {
  clearToken();
};
