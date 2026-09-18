"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Deck } from "@/lib/deck";
import { useDeckStore } from "@/lib/store";
import { useSlideNavigation } from "@/hooks/useSlideNavigation";
import { SlideFrame } from "./Slide";

/** Fullscreen playback with keyboard navigation and a speaker-notes overlay. */
export function PresenterMode({ deck }: { deck: Deck }) {
  const currentSlide = useDeckStore((state) => state.currentSlide);
  const currentStep = useDeckStore((state) => state.currentStep);
  const notesVisible = useDeckStore((state) => state.notesVisible);
  const setPresenting = useDeckStore((state) => state.setPresenting);
  const ref = useRef<HTMLDivElement>(null);

  const exit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    setPresenting(false);
  }, [setPresenting]);

  useSlideNavigation({ enabled: true, onExit: exit });

  useEffect(() => {
    const element = ref.current;
    element?.requestFullscreen?.().catch(() => {
      // Fullscreen can be refused; the overlay still covers the window.
    });

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setPresenting(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setPresenting]);

  const index = Math.min(currentSlide, deck.slides.length - 1);
  const slide = deck.slides[index];

  return (
    <div className="presenter" ref={ref}>
      <SlideFrame slide={slide} step={currentStep} transitionKey={index} />

      <div className="presenter-hud">
        <span>
          {index + 1} / {deck.slides.length}
        </span>
        <span>S notes</span>
        <span>Esc exit</span>
      </div>

      {notesVisible && <div className="presenter-notes">{slide.notes}</div>}
    </div>
  );
}
