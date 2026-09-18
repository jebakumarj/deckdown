"use client";

import { createPortal } from "react-dom";
import type { Deck } from "@/lib/deck";
import { useIsClient } from "@/hooks/useIsClient";
import { SlideView } from "./Slide";

/**
 * Every slide, full size, fragments revealed — hidden on screen and used only
 * by the print stylesheet for PDF export. Portalled to <body> so print.css can
 * hide the app chrome around it.
 */
export function PrintDeck({ deck, theme }: { deck: Deck; theme: string }) {
  if (!useIsClient()) return null;

  return createPortal(
    <div className="print-root deck" data-theme={theme} data-transition="none" aria-hidden="true">
      {deck.slides.map((slide, index) => (
        <SlideView key={index} slide={slide} />
      ))}
    </div>,
    document.body,
  );
}
