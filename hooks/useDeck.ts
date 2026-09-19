"use client";

import { useCallback, useDeferredValue, useEffect, useMemo } from "react";
import { renderDeck } from "@/lib/deck";
import type { Deck } from "@/lib/deck";
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

/** The theme actually in effect: toolbar choice wins over front matter. */
export function useActiveTheme(deck: Deck): string {
  const override = useDeckStore((state) => state.themeOverride);
  return override || deck.meta.theme;
}
