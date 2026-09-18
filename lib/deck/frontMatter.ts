import { DEFAULT_META, type DeckMeta, type TransitionId } from "./types";

export interface FrontMatterResult {
  meta: DeckMeta;
  body: string;
  /** Character offset where `body` starts in the original source. */
  bodyOffset: number;
}

const TRANSITIONS: readonly TransitionId[] = ["none", "fade", "slide"];

/**
 * Parses a leading `---` delimited block of simple `key: value` pairs.
 * Deliberately not full YAML: decks only need a handful of scalar fields.
 */
export function parseFrontMatter(source: string): FrontMatterResult {
  const normalized = source.replace(/\r\n/g, "\n");
  const match = /^---[ \t]*\n([\s\S]*?)\n?---[ \t]*(?:\n|$)/.exec(normalized);

  if (!match) {
    return { meta: { ...DEFAULT_META }, body: normalized, bodyOffset: 0 };
  }

  const meta: DeckMeta = { ...DEFAULT_META };

  for (const line of match[1].split("\n")) {
    const pair = /^([A-Za-z][\w-]*)[ \t]*:[ \t]*(.*)$/.exec(line.trim());
    if (!pair) continue;

    const key = pair[1].toLowerCase();
    const value = pair[2].trim().replace(/^["'](.*)["']$/, "$1");

    if (key === "title") meta.title = value;
    else if (key === "author") meta.author = value;
    else if (key === "theme" && value) meta.theme = value;
    else if (key === "transition" && (TRANSITIONS as readonly string[]).includes(value)) {
      meta.transition = value as TransitionId;
    }
  }

  return {
    meta,
    body: normalized.slice(match[0].length),
    bodyOffset: match[0].length,
  };
}
