/**
 * env.ts
 * Centralised, type-safe accessor for environment variables.
 * Import this instead of using import.meta.env directly throughout the codebase.
 */

export const ENV = {
  /** Base URL for all backend API requests */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,

  /** Current app environment */
  APP_ENV: import.meta.env.VITE_APP_ENV as "development" | "production",

  /** Display name of the application */
  APP_NAME: import.meta.env.VITE_APP_NAME as string,
} as const;
