import { parseFrontMatter } from "./frontMatter";
import { renderMarkdown } from "./markdown";
import { sanitizeHtml } from "./sanitize";
import { splitSlides } from "./split";
import type { Deck, RenderOptions, Slide } from "./types";

/**
 * Turns deck markdown into rendered, sanitized slides.
 *
 * Framework-free on purpose: the editor, the zip exporter and any future
 * server route all render decks through this one function.
 */
export function renderDeck(source: string, options: RenderOptions = {}): Deck {
  const { meta, body, bodyOffset } = parseFrontMatter(source);
  const env = { resolveAsset: options.resolveAsset };

  const slides: Slide[] = splitSlides(body, bodyOffset).map((raw) => {
    const groups = raw.steps.map((step, index) => {
      const html = renderMarkdown(step, env);
      return `<div class="step" data-step="${index}">${html}</div>`;
    });

    return {
      html: sanitizeHtml(groups.join("\n")),
      notes: raw.notes,
      layout: raw.layout,
      startOffset: raw.startOffset,
      stepCount: Math.max(0, groups.length - 1),
    };
  });

  return { meta, slides };
}

/** Index of the slide containing a caret offset in the source. */
export function slideIndexAtOffset(deck: Deck, offset: number): number {
  let index = 0;
  for (let i = 0; i < deck.slides.length; i++) {
    if (deck.slides[i].startOffset <= offset) index = i;
    else break;
  }
  return index;
}
