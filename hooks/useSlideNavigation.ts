"use client";

import { useEffect } from "react";
import { useDeckStore } from "@/lib/store";

interface Options {
  enabled: boolean;
  /** Called for Escape; presenter mode uses it to leave fullscreen. */
  onExit?: () => void;
}

/**
 * Keyboard navigation shared by the preview pane and presenter mode.
 * Forward/back walk through a slide's fragments before changing slide.
 */
export function useSlideNavigation({ enabled, onExit }: Options): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.closest("input, textarea, .cm-editor")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const store = useDeckStore.getState();

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
        case "Enter":
          event.preventDefault();
          store.next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
        case "Backspace":
          event.preventDefault();
          store.previous();
          break;
        case "Home":
          event.preventDefault();
          store.goToSlide(0);
          break;
        case "End":
          event.preventDefault();
          store.goToSlide(store.stepCounts.length - 1);
          break;
        case "s":
        case "S":
          event.preventDefault();
          store.toggleNotes();
          break;
        case "Escape":
          onExit?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onExit]);
}
