"use client";

import type { Deck } from "@/lib/deck";
import { useDeckStore } from "@/lib/store";
import { SLIDE_HEIGHT, SLIDE_WIDTH, SlideView } from "./Slide";

const THUMB_WIDTH = 160;

export function Filmstrip({ deck }: { deck: Deck }) {
  const currentSlide = useDeckStore((state) => state.currentSlide);
  const goToSlide = useDeckStore((state) => state.goToSlide);
  const scale = THUMB_WIDTH / SLIDE_WIDTH;

  return (
    <div className="filmstrip" role="tablist" aria-label="Slides">
      {deck.slides.map((slide, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          className="thumb"
          aria-current={index === currentSlide}
          aria-label={`Slide ${index + 1}`}
          style={{ width: THUMB_WIDTH, height: SLIDE_HEIGHT * scale }}
          onClick={() => goToSlide(index)}
        >
          <SlideView slide={slide} scale={scale} />
          <span className="index">{index + 1}</span>
        </button>
      ))}
    </div>
  );
}
