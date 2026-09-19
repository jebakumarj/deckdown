"use client";

/**
 * One origin serves both faces of the app: `/` is the promo page, and every
 * other root-level path is a deck open in the editor — `/monday-standup`.
 *
 * Deck paths are not files in the static export, so the host falls back to the
 * app shell, which reads the deck's name out of the address bar.
 */

/** Routes that are real pages, never deck names. */
const RESERVED_PATHS = new Set(["", "docs", "index.html", "404.html"]);

/**
 * The deck name in the current URL: `/monday-standup` -> `monday-standup`.
 * A trailing `.md` is still accepted so links made before decks dropped the
 * extension keep working.
 */
export function deckSlugFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const raw = decodeURIComponent(window.location.pathname).replace(/^\/+|\/+$/g, "");
  if (RESERVED_PATHS.has(raw) || raw.includes("/")) return null;
  return raw.replace(/\.md$/i, "") || null;
}

/**
 * Whether this page load belongs to the editor rather than the promo page: a
 * deck's own path, or the root with one of the entry flags the promo page
 * links to. The flags only survive until the open deck names itself, at which
 * point the address bar switches to that deck's path.
 */
export function isAppRoute(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("app") || params.has("new") || deckSlugFromPath() !== null;
}

/** Points the address bar at the open deck without adding history entries. */
export function syncDeckUrl(slug: string): void {
  if (typeof window === "undefined") return;
  const next = `/${encodeURIComponent(slug)}`;
  if (window.location.pathname + window.location.search !== next) {
    window.history.replaceState(null, "", next);
  }
}
