"use client";

import type { Deck } from "@/lib/deck";
import { useDeckStore } from "@/lib/store";
import { Filmstrip } from "./Filmstrip";
import { SlideFrame } from "./Slide";

export function PreviewPane({ deck }: { deck: Deck }) {
  const currentSlide = useDeckStore((state) => state.currentSlide);
  const currentStep = useDeckStore((state) => state.currentStep);
  const next = useDeckStore((state) => state.next);
  const previous = useDeckStore((state) => state.previous);

  const index = Math.min(currentSlide, deck.slides.length - 1);
  const slide = deck.slides[index];

  return (
    <section className="pane preview">
      <SlideFrame slide={slide} step={currentStep} transitionKey={index} />

      <div className="preview-bar">
        <button type="button" className="button" onClick={previous} aria-label="Previous slide">
          ←
        </button>
        <button type="button" className="button" onClick={next} aria-label="Next slide">
          →
        </button>
        <span>
          Slide {index + 1} of {deck.slides.length}
          {slide.stepCount > 0 ? ` · step ${currentStep + 1} of ${slide.stepCount + 1}` : ""}
        </span>
      </div>

      <Filmstrip deck={deck} />
    </section>
  );
}
