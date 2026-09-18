"use client";

import { useCallback, useDeferredValue, useEffect, useMemo } from "react";
import { renderDeck } from "@/lib/deck";
import type { Deck } from "@/lib/deck";
import { getAllAssets } from "@/lib/assets";
import { useDeckStore } from "@/lib/store";

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

/** Loads saved deck text and uploaded images once, on the client. */
export function useHydrateDeck(): void {
  const hydrate = useDeckStore((state) => state.hydrate);
  const addAssets = useDeckStore((state) => state.addAssets);

  useEffect(() => {
    hydrate();

    let urls: string[] = [];
    let cancelled = false;

    getAllAssets().then((records) => {
      if (cancelled) return;
      const entries = records.map((record) => ({
        record,
        url: URL.createObjectURL(record.blob),
      }));
      urls = entries.map((entry) => entry.url);
      if (entries.length > 0) addAssets(entries);
    });

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [hydrate, addAssets]);
}

/** The theme actually in effect: toolbar choice wins over front matter. */
export function useActiveTheme(deck: Deck): string {
  const override = useDeckStore((state) => state.themeOverride);
  return override || deck.meta.theme;
}
