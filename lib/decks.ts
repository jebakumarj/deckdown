"use client";

import { parseFrontMatter, splitSlides } from "@/lib/deck";
import { DECK_STORE, isStorageAvailable, newId, withStore } from "./db";

export interface DeckRecord {
  id: string;
  /** Display name, derived from the deck on every save. */
  title: string;
  /** URL name, derived from the title and unique across the library. */
  slug: string;
  source: string;
  themeOverride: string;
  slideCount: number;
  createdAt: number;
  updatedAt: number;
}

export const UNTITLED = "Untitled deck";

/**
 * Names a deck cannot use, now that deck URLs sit at the root without an
 * extension: they belong to real routes or to the export's own files.
 */
const RESERVED_SLUGS = new Set(["docs", "index", "app", "new", "404", "_next", "favicon"]);

/**
 * A deck's name: its front matter title, else its first heading, else a
 * placeholder. Decks are never named separately from their content.
 */
export function deckTitle(source: string): string {
  const { meta, body } = parseFrontMatter(source);
  if (meta.title.trim()) return meta.title.trim();

  const heading = /^[ \t]{0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/m.exec(body);
  if (heading) return heading[1].trim();

  const firstWords = body.trim().split("\n")[0]?.trim();
  return firstWords ? firstWords.slice(0, 60) : UNTITLED;
}

/** Turns a deck name into something that reads well in an address bar. */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return base || "untitled";
}

/** The same slug where possible, suffixed when another deck already has it. */
async function uniqueSlug(base: string, ownerId: string): Promise<string> {
  const taken = new Set([
    ...RESERVED_SLUGS,
    ...(await listDecks()).filter((deck) => deck.id !== ownerId).map((deck) => deck.slug),
  ]);
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function getDeckBySlug(slug: string): Promise<DeckRecord | undefined> {
  const wanted = slug.toLowerCase();
  return (await listDecks()).find((deck) => deck.slug === wanted);
}

export function newDeckRecord(source = ""): DeckRecord {
  const now = Date.now();
  const title = deckTitle(source);
  const base = slugify(title);
  return {
    id: newId(),
    title,
    slug: RESERVED_SLUGS.has(base) ? `${base}-deck` : base,
    source,
    themeOverride: "",
    slideCount: countSlides(source),
    createdAt: now,
    updatedAt: now,
  };
}

function countSlides(source: string): number {
  const { body, bodyOffset } = parseFrontMatter(source);
  return splitSlides(body, bodyOffset).length;
}

export async function listDecks(): Promise<DeckRecord[]> {
  if (!isStorageAvailable()) return [];
  try {
    const decks = await withStore<DeckRecord[]>(DECK_STORE, "readonly", (store) =>
      store.getAll() as IDBRequest<DeckRecord[]>,
    );
    return decks
      // Decks saved before slugs existed get one on the way out.
      .map((deck) => (deck.slug ? deck : { ...deck, slug: slugify(deck.title) }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function getDeck(id: string): Promise<DeckRecord | undefined> {
  if (!isStorageAvailable()) return undefined;
  try {
    return await withStore<DeckRecord | undefined>(DECK_STORE, "readonly", (store) =>
      store.get(id) as IDBRequest<DeckRecord | undefined>,
    );
  } catch {
    return undefined;
  }
}

export async function putDeck(record: DeckRecord): Promise<void> {
  if (!isStorageAvailable()) return;
  try {
    await withStore(DECK_STORE, "readwrite", (store) => store.put(record) as IDBRequest<IDBValidKey>);
  } catch {
    // Storage can be blocked or full; the deck still works in memory.
  }
}

/**
 * Writes the current text of a deck, refreshing its derived name, slug and
 * slide count. Returns the slug, which the address bar follows.
 */
export async function saveDeckContent(
  id: string,
  source: string,
  themeOverride: string,
): Promise<string> {
  const existing = await getDeck(id);
  const title = deckTitle(source);
  const base = slugify(title);
  // Keep the deck's current slug when the name has not really changed, so the
  // URL does not churn on every keystroke.
  const slug =
    existing && slugify(existing.title) === base ? existing.slug : await uniqueSlug(base, id);
  const now = Date.now();

  await putDeck({
    id,
    title,
    slug,
    source,
    themeOverride,
    slideCount: countSlides(source),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  return slug;
}

export async function deleteDeck(id: string): Promise<void> {
  if (!isStorageAvailable()) return;
  try {
    await withStore(DECK_STORE, "readwrite", (store) => store.delete(id) as IDBRequest<undefined>);
  } catch {
    // Nothing to do; the deck stays until storage works again.
  }
}
