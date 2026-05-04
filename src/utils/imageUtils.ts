import { ENV } from "../config/env";

/**
 * Converts a backend image path to a full browser-accessible URL.
 * Handles Windows backslashes and null values.
 */
export function getEventImageUrl(imagePath: string | null | undefined): string {
  const FALLBACK = "https://picsum.photos/seed/default/600/400";

  if (!imagePath) return FALLBACK;

  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) return imagePath;

  // Convert Windows backslashes to forward slashes and remove leading slash if present
  let normalized = imagePath.replace(/\\/g, "/");
  if (normalized.startsWith("/")) {
    normalized = normalized.substring(1);
  }

  const baseUrl = ENV.API_BASE_URL.endsWith("/")
    ? ENV.API_BASE_URL.slice(0, -1)
    : ENV.API_BASE_URL;

  const finalUrl = `${baseUrl}/${normalized}`;
  
  // console.debug(`[Image] Resolving ${imagePath} -> ${finalUrl}`);
  
  return finalUrl;
}
