"use client";

import { create } from "zustand";
import { SAMPLE_DECK } from "./sample";
import type { AssetRecord } from "./assets";

const SOURCE_KEY = "presentation.md:source";
const THEME_KEY = "presentation.md:theme";

export interface AssetEntry {
  record: AssetRecord;
  url: string;
}

interface DeckState {
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
  hydrate: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function save(source: string, themeOverride: string) {
  if (typeof window === "undefined") return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(SOURCE_KEY, source);
      window.localStorage.setItem(THEME_KEY, themeOverride);
    } catch {
      // Storage can be full or blocked; the deck still works in memory.
    }
  }, 400);
}

export const useDeckStore = create<DeckState>((set, get) => ({
  source: SAMPLE_DECK,
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
    save(source, get().themeOverride);
  },

  setThemeOverride: (themeOverride) => {
    set({ themeOverride });
    save(get().source, themeOverride);
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

  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    try {
      const source = window.localStorage.getItem(SOURCE_KEY);
      const theme = window.localStorage.getItem(THEME_KEY);
      set({
        source: source ?? SAMPLE_DECK,
        themeOverride: theme ?? "",
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));

export const THEMES = [
  { id: "minimal-light", label: "Minimal light" },
  { id: "minimal-dark", label: "Minimal dark" },
  { id: "serif", label: "Serif" },
];
