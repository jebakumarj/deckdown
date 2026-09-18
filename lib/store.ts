"use client";

import { create } from "zustand";
import type { AssetRecord } from "./assets";
import { type DeckRecord, saveDeckContent } from "./decks";
import { syncDeckUrl } from "./host";

const LAST_DECK_KEY = "deckdown:lastDeckId";
/** The key this app used before it was renamed to deckdown. */
const LEGACY_LAST_DECK_KEY = "presentation.md:lastDeckId";

export interface AssetEntry {
  record: AssetRecord;
  url: string;
}

interface DeckState {
  /** Which stored deck is open. Null only before hydration finishes. */
  deckId: string | null;
  /** The open deck's URL name; the address bar follows it. */
  deckSlug: string | null;
  source: string;
  /** Theme picked in the toolbar; empty means "use the front matter value". */
  themeOverride: string;
  currentSlide: number;
  currentStep: number;
  direction: "forward" | "backward";
  presenting: boolean;
  notesVisible: boolean;
  hydrated: boolean;
  assets: Record<string, AssetEntry>;
  stepCounts: number[];

  setSource: (source: string) => void;
  setThemeOverride: (theme: string) => void;
  setStepCounts: (counts: number[]) => void;
  goToSlide: (index: number, step?: number) => void;
  next: () => void;
  previous: () => void;
  setPresenting: (presenting: boolean) => void;
  toggleNotes: () => void;
  addAssets: (entries: AssetEntry[]) => void;
  /** Swaps the open deck for a stored one, without touching what is on disk. */
  openDeck: (record: DeckRecord) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

/** Debounced write of the open deck to IndexedDB. */
function scheduleSave(deckId: string | null, source: string, themeOverride: string) {
  if (typeof window === "undefined" || !deckId) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const slug = await saveDeckContent(deckId, source, themeOverride);
    // Renaming a deck renames its URL.
    if (useDeckStore.getState().deckId !== deckId) return;
    if (slug !== useDeckStore.getState().deckSlug) useDeckStore.setState({ deckSlug: slug });
    syncDeckUrl(slug);
  }, 400);
}

export function rememberLastDeck(deckId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (deckId) window.localStorage.setItem(LAST_DECK_KEY, deckId);
    else window.localStorage.removeItem(LAST_DECK_KEY);
    window.localStorage.removeItem(LEGACY_LAST_DECK_KEY);
  } catch {
    // Remembering the last deck is a convenience, not a requirement.
  }
}

export function lastDeckId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem(LAST_DECK_KEY) ??
      window.localStorage.getItem(LEGACY_LAST_DECK_KEY)
    );
  } catch {
    return null;
  }
}

export const useDeckStore = create<DeckState>((set, get) => ({
  deckId: null,
  deckSlug: null,
  source: "",
  themeOverride: "",
  currentSlide: 0,
  currentStep: 0,
  direction: "forward",
  presenting: false,
  notesVisible: false,
  hydrated: false,
  assets: {},
  stepCounts: [],

  setSource: (source) => {
    set({ source });
    scheduleSave(get().deckId, source, get().themeOverride);
  },

  setThemeOverride: (themeOverride) => {
    set({ themeOverride });
    scheduleSave(get().deckId, get().source, themeOverride);
  },

  setStepCounts: (stepCounts) => {
    const { currentSlide, currentStep } = get();
    const slide = Math.min(currentSlide, Math.max(0, stepCounts.length - 1));
    set({
      stepCounts,
      currentSlide: slide,
      currentStep: Math.min(currentStep, stepCounts[slide] ?? 0),
    });
  },

  goToSlide: (index, step = 0) => {
    const { stepCounts, currentSlide } = get();
    const slide = Math.max(0, Math.min(index, Math.max(0, stepCounts.length - 1)));
    set({
      currentSlide: slide,
      currentStep: Math.max(0, Math.min(step, stepCounts[slide] ?? 0)),
      direction: slide < currentSlide ? "backward" : "forward",
    });
  },

  next: () => {
    const { currentSlide, currentStep, stepCounts } = get();
    if (currentStep < (stepCounts[currentSlide] ?? 0)) {
      set({ currentStep: currentStep + 1 });
    } else if (currentSlide < stepCounts.length - 1) {
      set({ currentSlide: currentSlide + 1, currentStep: 0, direction: "forward" });
    }
  },

  previous: () => {
    const { currentSlide, currentStep, stepCounts } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    } else if (currentSlide > 0) {
      // Step back into the previous slide fully revealed.
      set({
        currentSlide: currentSlide - 1,
        currentStep: stepCounts[currentSlide - 1] ?? 0,
        direction: "backward",
      });
    }
  },

  setPresenting: (presenting) => set({ presenting }),

  toggleNotes: () => set({ notesVisible: !get().notesVisible }),

  addAssets: (entries) =>
    set({
      assets: {
        ...get().assets,
        ...Object.fromEntries(entries.map((entry) => [entry.record.id, entry])),
      },
    }),

  openDeck: (record) => {
    clearTimeout(saveTimer);
    rememberLastDeck(record.id);
    syncDeckUrl(record.slug);
    set({
      deckId: record.id,
      deckSlug: record.slug,
      source: record.source,
      themeOverride: record.themeOverride,
      currentSlide: 0,
      currentStep: 0,
      presenting: false,
      hydrated: true,
    });
  },
}));

export const THEMES = [
  { id: "minimal-light", label: "Minimal light" },
  { id: "minimal-dark", label: "Minimal dark" },
  { id: "serif", label: "Serif" },
];
