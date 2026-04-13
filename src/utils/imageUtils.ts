import { ENV } from "../config/env";

/**
 * Converts a backend image path to a full browser-accessible URL.
 * Handles Windows backslashes and null values.
 */
export function getEventImageUrl(imagePath: string | null | undefined): string {
  const FALLBACK = "https://picsum.photos/seed/default/600/400";

  if (!imagePath) return FALLBACK;

  // Convert Windows backslashes to forward slashes
  const normalized = imagePath.replace(/\\/g, "/");

  return `${ENV.API_BASE_URL}/${normalized}`;
}
