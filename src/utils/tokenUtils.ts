/**
 * tokenUtils.ts
 * Helper functions for managing the JWT access token in localStorage.
 * Token is the only auth-related data stored locally.
 * User profile data is fetched dynamically from the backend.
 */

const TOKEN_KEY = "nea_access_token";
const TOKEN_EXPIRY_KEY = "nea_token_expiry";
const ADMIN_TOKEN_KEY = "nea_admin_access_token";
const ADMIN_TOKEN_EXPIRY_KEY = "nea_admin_token_expiry";

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

/** Persist the admin JWT token after a successful admin login */
export const saveAdminToken = (token: string, expiry?: number): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (expiry) {
    localStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, expiry.toString());
  }
};

/** Retrieve the stored admin JWT token, or null if not present */
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

/** Remove the admin JWT token */
export const clearAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
};

/** Remove all auth-related data (full logout) */
export const clearAuthData = (): void => {
  clearToken();
  clearAdminToken();
};
