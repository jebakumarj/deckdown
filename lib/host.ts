"use client";

/**
 * The marketing page and the editor are the same static bundle served from two
 * hosts: `example.com` shows the pitch, `app.example.com` shows the editor. In
 * development that is `localhost:3000` and `app.localhost:3000`.
 *
 * `?app=1` forces the editor, so the whole thing still works when both live on
 * a single host (a project page on GitHub Pages, say).
 */
export function isAppHost(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).has("app")) return true;
  return window.location.hostname.startsWith("app.");
}

/** A URL on the app host, whichever host the current page is on. */
export function appUrl(path = "/"): string {
  if (typeof window === "undefined") return path;
  const { protocol, hostname, host } = window.location;
  const appHost = hostname.startsWith("app.") ? host : `app.${host}`;
  return `${protocol}//${appHost}${path}`;
}

/** A URL on the marketing host, i.e. the same host without the `app.` prefix. */
export function siteUrl(path = "/"): string {
  if (typeof window === "undefined") return path;
  const { protocol, hostname, host } = window.location;
  if (!hostname.startsWith("app.")) return path;
  return `${protocol}//${host.slice("app.".length)}${path}`;
}

/** True when the app and the marketing page share an origin (single-host setup). */
export function isSingleOrigin(): boolean {
  if (typeof window === "undefined") return true;
  return new URL(appUrl("/")).origin === window.location.origin;
}

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

/** The path a deck lives at, keeping single-origin mode's ?app flag. */
export function deckPath(slug: string): string {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const suffix = params?.has("app") ? "?app=1" : "";
  return `/${encodeURIComponent(slug)}${suffix}`;
}

/** Points the address bar at the open deck without adding history entries. */
export function syncDeckUrl(slug: string): void {
  if (typeof window === "undefined") return;
  const next = deckPath(slug);
  if (window.location.pathname + window.location.search !== next) {
    window.history.replaceState(null, "", next);
  }
}
