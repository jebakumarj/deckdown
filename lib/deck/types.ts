export type SlideLayout = "default" | "center" | "full";

export type TransitionId = "none" | "fade" | "slide";

export interface DeckMeta {
  title: string;
  author: string;
  theme: string;
  transition: TransitionId;
}

/** A slide as it comes out of the splitter, still markdown. */
export interface RawSlide {
  /** Slide body with notes/layout directives removed. */
  markdown: string;
  /** Markdown of each reveal group; group 0 is visible immediately. */
  steps: string[];
  notes: string;
  layout: SlideLayout;
  /** Character offset of the slide's first line in the original source. */
  startOffset: number;
}

/** A rendered slide. */
export interface Slide {
  html: string;
  notes: string;
  layout: SlideLayout;
  startOffset: number;
  /** Number of reveals after the initial state (0 = nothing to step through). */
  stepCount: number;
}

export interface Deck {
  meta: DeckMeta;
  slides: Slide[];
}

export interface RenderOptions {
  /** Maps an `asset:<id>` image id to a URL the browser can load. */
  resolveAsset?: (id: string) => string | undefined;
}

export const DEFAULT_META: DeckMeta = {
  title: "",
  author: "",
  theme: "minimal-light",
  transition: "fade",
};
