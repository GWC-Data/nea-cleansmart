/**
 * tokenUtils.ts
 * Helper functions for managing the JWT access token in localStorage.
 * These are the only place the app should read/write the token.
 */

const TOKEN_KEY = "nea_access_token";
const USER_KEY = "nea_user_profile";

import type { UserProfile } from "../types/auth.types";

/** Persist the JWT token after a successful login */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/** Retrieve the stored JWT token, or null if not present */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/** Remove the JWT token (used on logout) */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/** Persist the logged-in user's profile */
export const saveUserProfile = (user: UserProfile): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Retrieve the stored user profile, or null */
export const getUserProfile = (): UserProfile | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

/** Remove the user profile (used on logout) */
export const clearUserProfile = (): void => {
  localStorage.removeItem(USER_KEY);
};

/** Remove all auth-related data (full logout) */
export const clearAuthData = (): void => {
  clearToken();
  clearUserProfile();
};
