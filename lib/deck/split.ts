import type { RawSlide, SlideLayout } from "./types";

const SEPARATOR = /^\*\*\*[ \t]*$/;
const FENCE = /^[ \t]*(```+|~~~+)/;
const STEP_LINE = /^[ \t]*<!--[ \t]*step[ \t]*-->[ \t]*$/;
const NOTES = /<!--[ \t]*notes:([\s\S]*?)-->/gi;
const LAYOUT = /<!--[ \t]*layout:[ \t]*(default|center|full)[ \t]*-->[ \t]*\n?/i;

/**
 * Splits the deck body into slides on `***` lines.
 *
 * A separator only counts when it sits on its own line, is preceded by a blank
 * line (or starts the body), and is not inside a fenced code block — so a
 * horizontal rule written mid-paragraph, or `***` inside a code sample, stays
 * part of the slide.
 */
export function splitSlides(body: string, baseOffset = 0): RawSlide[] {
  const lines = body.split("\n");
  const chunks: { text: string; offset: number }[] = [];

  let current: string[] = [];
  let currentOffset = baseOffset;
  let offset = baseOffset;
  let fence: string | null = null;

  const flush = () => {
    chunks.push({ text: current.join("\n"), offset: currentOffset });
    current = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = FENCE.exec(line);

    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
    }

    const previousIsBlank = i === 0 || lines[i - 1].trim() === "";

    if (fence === null && SEPARATOR.test(line) && previousIsBlank) {
      flush();
      currentOffset = offset + line.length + 1;
    } else {
      current.push(line);
    }

    offset += line.length + 1;
  }
  flush();

  const slides = chunks
    .map((chunk) => toSlide(chunk.text, chunk.offset))
    .filter((slide, index, all) => slide.markdown.trim() !== "" || all.length === 1);

  return slides.length > 0 ? slides : [toSlide("", baseOffset)];
}

function toSlide(text: string, startOffset: number): RawSlide {
  const notes: string[] = [];
  let markdown = text.replace(NOTES, (_full, note: string) => {
    notes.push(note.trim());
    return "";
  });

  let layout: SlideLayout = "default";
  const layoutMatch = LAYOUT.exec(markdown);
  if (layoutMatch) {
    layout = layoutMatch[1].toLowerCase() as SlideLayout;
    markdown = markdown.replace(LAYOUT, "");
  }

  markdown = markdown.replace(/^\n+/, "").replace(/\s+$/, "");

  const steps = splitSteps(markdown);

  return {
    markdown,
    steps,
    notes: notes.join("\n\n"),
    layout,
    startOffset,
  };
}

/** Splits a slide on `<!-- step -->` lines, ignoring markers inside code fences. */
function splitSteps(markdown: string): string[] {
  const lines = markdown.split("\n");
  const groups: string[][] = [[]];
  let fence: string | null = null;

  for (const line of lines) {
    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
    }

    if (fence === null && STEP_LINE.test(line)) groups.push([]);
    else groups[groups.length - 1].push(line);
  }

  return groups
    .map((group) => group.join("\n").trim())
    .filter((group, index) => group !== "" || index === 0);
}
