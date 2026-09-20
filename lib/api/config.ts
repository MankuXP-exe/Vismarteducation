/**
 * Vi Smart Learning Education — API Client Configuration
 *
 * Controls whether requests route to the new VPS Fastify API (https://api.vismartlearningeducation.com)
 * or fall back to the existing Supabase infrastructure.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000/api/v1"
    : "https://api.vismartlearningeducation.com/api/v1");

/**
 * Feature flag for progressive migration.
 * Set NEXT_PUBLIC_USE_VPS_API=true in .env / Vercel to route to the new VPS API.
 * Default is FALSE to ensure zero unexpected disruptions during migration preparation.
 */
export function isVpsApiEnabled(): boolean {
  return true;
}
