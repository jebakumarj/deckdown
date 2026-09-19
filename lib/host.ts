"use client";

/**
 * The promo page and the editor are the same static bundle served from two
 * hosts: `example.com` shows the pitch, `app.example.com` shows the editor. In
 * development that is `localhost:3000` and `app.localhost:3000`.
 *
 * `?app=1` forces the editor, so the whole thing still works when both live on
 * a single host. A host that cannot serve a sibling `app.` subdomain — GitHub
 * Pages, say — is built with `NEXT_PUBLIC_SINGLE_ORIGIN=1`, which makes every
 * link to the app stay on this origin and carry that flag instead.
 */
const SINGLE_ORIGIN = process.env.NEXT_PUBLIC_SINGLE_ORIGIN === "1";

/**
 * Sub-path the site is served from — `/deckdown` on a GitHub project page,
 * empty at a domain root. Next prefixes its own routes and assets with this;
 * the URLs we build by hand have to do it themselves.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a root-relative path with the deployment's base path. */
export function assetUrl(path: string): string {
  return withBase(path);
}

function withBase(path: string): string {
  return BASE_PATH && path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}

/** The same path with `?app=1` added, keeping any query it already carries. */
function withAppFlag(path: string): string {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("app", "1");
  return `${pathname}?${params}`;
}

export function isAppHost(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).has("app")) return true;
  return !SINGLE_ORIGIN && window.location.hostname.startsWith("app.");
}

/** A URL on the app host, whichever host the current page is on. */
export function appUrl(path = "/"): string {
  if (SINGLE_ORIGIN) return withAppFlag(withBase(path));
  if (typeof window === "undefined") return withBase(path);
  const { protocol, hostname, host } = window.location;
  const appHost = hostname.startsWith("app.") ? host : `app.${host}`;
  return `${protocol}//${appHost}${withBase(path)}`;
}

/** A URL on the promo host, i.e. the same host without the `app.` prefix. */
export function siteUrl(path = "/"): string {
  if (SINGLE_ORIGIN) return withBase(path);
  if (typeof window === "undefined") return withBase(path);
  const { protocol, hostname, host } = window.location;
  if (!hostname.startsWith("app.")) return withBase(path);
  return `${protocol}//${host.slice("app.".length)}${withBase(path)}`;
}

/** True when the app and the promo page share an origin (single-host setup). */
export function isSingleOrigin(): boolean {
  if (SINGLE_ORIGIN) return true;
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
  let raw = decodeURIComponent(window.location.pathname);
  if (BASE_PATH && raw.startsWith(BASE_PATH)) raw = raw.slice(BASE_PATH.length);
  raw = raw.replace(/^\/+|\/+$/g, "");
  if (RESERVED_PATHS.has(raw) || raw.includes("/")) return null;
  return raw.replace(/\.md$/i, "") || null;
}

/** The path a deck lives at, keeping single-origin mode's ?app flag. */
function deckPath(slug: string): string {
  const path = withBase(`/${encodeURIComponent(slug)}`);
  if (SINGLE_ORIGIN) return withAppFlag(path);
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  return params?.has("app") ? withAppFlag(path) : path;
}

/** Points the address bar at the open deck without adding history entries. */
export function syncDeckUrl(slug: string): void {
  if (typeof window === "undefined") return;
  const next = deckPath(slug);
  if (window.location.pathname + window.location.search !== next) {
    window.history.replaceState(null, "", next);
  }
}
