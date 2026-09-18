"use client";

import { useCallback, useDeferredValue, useEffect, useMemo } from "react";
import { renderDeck } from "@/lib/deck";
import type { Deck } from "@/lib/deck";
import { getAllAssets } from "@/lib/assets";
import {
  deckTitle,
  deleteDeck,
  getDeck,
  getDeckBySlug,
  listDecks,
  newDeckRecord,
  putDeck,
  UNTITLED,
  type DeckRecord,
} from "@/lib/decks";
import { deckSlugFromPath } from "@/lib/host";
import { SAMPLE_DECK } from "@/lib/sample";
import { lastDeckId, rememberLastDeck, useDeckStore } from "@/lib/store";

/** Renders the current source into a deck, off the typing critical path. */
export function useDeck(): Deck {
  const source = useDeckStore((state) => state.source);
  const assets = useDeckStore((state) => state.assets);
  const setStepCounts = useDeckStore((state) => state.setStepCounts);

  const deferredSource = useDeferredValue(source);
  const resolveAsset = useCallback((id: string) => assets[id]?.url, [assets]);

  const deck = useMemo(
    () => renderDeck(deferredSource, { resolveAsset }),
    [deferredSource, resolveAsset],
  );

  useEffect(() => {
    setStepCounts(deck.slides.map((slide) => slide.stepCount));
  }, [deck, setStepCounts]);

  return deck;
}

const LEGACY_SOURCE_KEY = "presentation.md:source";
const LEGACY_THEME_KEY = "presentation.md:theme";

/**
 * Which deck to open is decided once per page load. Without this, React's
 * development double-invoke runs the effect twice, both runs find an empty
 * library, and the first-time visitor ends up with two sample decks.
 */
let pendingChoice: Promise<DeckRecord> | null = null;

/**
 * Decides which deck to open, and loads the images it may reference.
 *
 * A deck's own URL (`/monday-standup`) opens it and `?new=1` starts an
 * empty deck; otherwise the last deck the user had open comes back. A
 * first-time visitor gets the sample deck, saved as their first real deck.
 */
export function useHydrateDeck(): void {
  const openDeck = useDeckStore((state) => state.openDeck);
  const addAssets = useDeckStore((state) => state.addAssets);

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];

    const start = async () => {
      const wantsNew = new URLSearchParams(window.location.search).get("new") === "1";

      pendingChoice ??= chooseDeck(wantsNew, deckSlugFromPath());
      const record = await pendingChoice;
      if (cancelled) return;
      openDeck(record);



      const records = await getAllAssets();
      if (cancelled) return;
      const entries = records.map((asset) => ({
        record: asset,
        url: URL.createObjectURL(asset.blob),
      }));
      urls = entries.map((entry) => entry.url);
      if (entries.length > 0) addAssets(entries);
    };

    void start();

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [openDeck, addAssets]);
}

async function chooseDeck(wantsNew: boolean, slug: string | null): Promise<DeckRecord> {
  if (wantsNew) return createDeck("");

  if (slug) {
    const bySlug = await getDeckBySlug(slug);
    if (bySlug) return bySlug;
  }

  const remembered = lastDeckId();
  if (remembered) {
    const deck = await getDeck(remembered);
    if (deck) return deck;
  }

  const migrated = await migrateLegacyDeck();
  if (migrated) return migrated;

  const decks = await listDecks();
  if (decks.length > 0) return decks[0];

  // First visit: the sample deck becomes the user's first saved deck.
  return createDeck(SAMPLE_DECK);
}

async function createDeck(source: string): Promise<DeckRecord> {
  const record = newDeckRecord(source);
  await putDeck(record);
  return record;
}

/** Moves a deck saved by the single-deck version of the app into the library. */
async function migrateLegacyDeck(): Promise<DeckRecord | undefined> {
  let source: string | null = null;
  let theme = "";
  try {
    source = window.localStorage.getItem(LEGACY_SOURCE_KEY);
    theme = window.localStorage.getItem(LEGACY_THEME_KEY) ?? "";
  } catch {
    return undefined;
  }
  if (!source) return undefined;

  const record = { ...newDeckRecord(source), themeOverride: theme };
  await putDeck(record);
  try {
    window.localStorage.removeItem(LEGACY_SOURCE_KEY);
    window.localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    // The deck is saved either way.
  }
  return record;
}

/**
 * Deletes a deck after confirming, and — when it was the one on screen — opens
 * the next most recent deck, or a blank one if the library is now empty. Both
 * the toolbar and the switcher go through here, so they behave identically.
 *
 * Pass a deck to delete that one; omit it to delete the open deck. Resolves to
 * true when something was deleted.
 */
export function useDeleteDeck(): (target?: { id: string; title: string }) => Promise<boolean> {
  const openDeck = useDeckStore((state) => state.openDeck);

  return useCallback(
    async (target) => {
      const state = useDeckStore.getState();
      const id = target?.id ?? state.deckId;
      if (!id) return false;

      const name = target?.title || deckTitle(state.source) || UNTITLED;
      if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return false;

      await deleteDeck(id);

      if (id === state.deckId) {
        rememberLastDeck(null);
        const remaining = await listDecks();
        const next = remaining[0] ?? (await createDeck(""));
        pendingChoice = Promise.resolve(next);
        openDeck(next);
      }

      return true;
    },
    [openDeck],
  );
}

/** Starts a new empty deck without leaving the app. */
export function useNewDeck(): () => Promise<void> {
  const openDeck = useDeckStore((state) => state.openDeck);
  return useCallback(async () => {
    const record = await createDeck("");
    pendingChoice = Promise.resolve(record);
    openDeck(record);
  }, [openDeck]);
}

/** The theme actually in effect: toolbar choice wins over front matter. */
export function useActiveTheme(deck: Deck): string {
  const override = useDeckStore((state) => state.themeOverride);
  return override || deck.meta.theme;
}
