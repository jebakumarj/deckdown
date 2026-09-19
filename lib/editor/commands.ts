"use client";

import { EditorSelection, type ChangeSpec, type EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

/**
 * The edits behind the editor's formatting toolbar. Each one works on every
 * selection range, leaves the caret somewhere useful, and is its own opposite
 * where markdown allows it — pressing bold twice gives the text back.
 */

/** Wraps each selection in `marker`, or unwraps it when it is already wrapped. */
export function toggleWrap(view: EditorView, marker: string, closing = marker): void {
  const { state } = view;

  view.dispatch(
    state.changeByRange((range) => {
      const selected = state.sliceDoc(range.from, range.to);
      const before = state.sliceDoc(Math.max(0, range.from - marker.length), range.from);
      const after = state.sliceDoc(range.to, Math.min(state.doc.length, range.to + closing.length));

      // The markers are inside the selection: "**word**" selected whole.
      if (
        selected.length >= marker.length + closing.length &&
        selected.startsWith(marker) &&
        selected.endsWith(closing)
      ) {
        const inner = selected.slice(marker.length, selected.length - closing.length);
        return {
          changes: { from: range.from, to: range.to, insert: inner },
          range: EditorSelection.range(range.from, range.from + inner.length),
        };
      }

      // The markers are just outside it: "word" selected inside "**word**".
      if (before === marker && after === closing) {
        return {
          changes: [
            { from: range.from - marker.length, to: range.from },
            { from: range.to, to: range.to + closing.length },
          ],
          range: EditorSelection.range(range.from - marker.length, range.to - marker.length),
        };
      }

      return {
        changes: [
          { from: range.from, insert: marker },
          { from: range.to, insert: closing },
        ],
        range: EditorSelection.range(range.from + marker.length, range.to + marker.length),
      };
    }),
  );
  view.focus();
}

export interface LinePrefix {
  /** The prefix for the nth line of the block, so ordered lists can count. */
  text: (index: number) => string;
  /** Matches a prefix of this kind, so pressing the button again removes it. */
  pattern: RegExp;
}

export const BULLET: LinePrefix = { text: () => "- ", pattern: /^[ \t]*[-*+] / };
export const NUMBERED: LinePrefix = { text: (i) => `${i + 1}. `, pattern: /^[ \t]*\d+\. / };
export const QUOTE: LinePrefix = { text: () => "> ", pattern: /^[ \t]*> / };
/** One per heading level, so a level can be toggled off by pressing it again. */
const HEADINGS: LinePrefix[] = [
  { text: () => "# ", pattern: /^[ \t]*# / },
  { text: () => "## ", pattern: /^[ \t]*## / },
  { text: () => "### ", pattern: /^[ \t]*### / },
  { text: () => "#### ", pattern: /^[ \t]*#### / },
  { text: () => "##### ", pattern: /^[ \t]*##### / },
  { text: () => "###### ", pattern: /^[ \t]*###### / },
];

export const MAX_HEADING = HEADINGS.length;

/** The heading level under the caret, or null when the line is body text. */
export function headingLevelAt(state: EditorState): number | null {
  const line = state.doc.lineAt(state.selection.main.head);
  const match = /^[ \t]*(#{1,6}) /.exec(line.text);
  return match ? match[1].length : null;
}

/** Makes every touched line a heading at this level, or plain text again. */
export function toggleHeading(view: EditorView, level: number): void {
  applyLinePrefix(view, HEADINGS[level - 1], true);
}

/** Moves every touched line to this heading level, whatever it was before. */
export function setHeadingLevel(view: EditorView, level: number): void {
  applyLinePrefix(view, HEADINGS[level - 1], false);
}

/** Adds a prefix to every touched line, or strips it when they all have one. */
export function toggleLinePrefix(view: EditorView, prefix: LinePrefix): void {
  applyLinePrefix(view, prefix, true);
}

function applyLinePrefix(view: EditorView, prefix: LinePrefix, toggle: boolean): void {
  const { state } = view;
  const lines = [];
  const seen = new Set<number>();

  for (const range of state.selection.ranges) {
    const first = state.doc.lineAt(range.from).number;
    const last = state.doc.lineAt(range.to).number;
    for (let n = first; n <= last; n++) {
      if (seen.has(n)) continue;
      seen.add(n);
      lines.push(state.doc.line(n));
    }
  }

  const strip = toggle && lines.every((line) => prefix.pattern.test(line.text));
  const changes: ChangeSpec[] = lines.map((line, index) => {
    if (strip) {
      const [match] = prefix.pattern.exec(line.text) ?? [""];
      return { from: line.from, to: line.from + match.length, insert: "" };
    }
    // Replace a prefix of another kind rather than stacking them up.
    const [existing] = /^[ \t]*(?:[-*+] |\d+\. |> |#{1,6} )/.exec(line.text) ?? [""];
    return { from: line.from, to: line.from + existing.length, insert: prefix.text(index) };
  });

  view.dispatch({ changes, scrollIntoView: true });
  view.focus();
}

/**
 * Drops a block on a line of its own, with a blank line before it so markdown
 * reads it as a new block. The caret lands at the end of what was inserted.
 */
export function insertBlock(view: EditorView, block: string): void {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const onBlankLine = line.length === 0;
  const from = onBlankLine ? line.from : line.to;
  const insert = onBlankLine ? `${block}\n` : `\n\n${block}\n`;

  view.dispatch({
    changes: { from, insert },
    selection: { anchor: from + insert.trimEnd().length },
    scrollIntoView: true,
  });
  view.focus();
}

/**
 * Turns the selection into a link and selects the placeholder URL, so the
 * address can be pasted straight over it.
 */
export function insertLink(view: EditorView): void {
  const { state } = view;
  const placeholder = "https://";

  view.dispatch(
    state.changeByRange((range) => {
      const text = state.sliceDoc(range.from, range.to) || "link text";
      const insert = `[${text}](${placeholder})`;
      const urlFrom = range.from + text.length + 3;
      return {
        changes: { from: range.from, to: range.to, insert },
        range: EditorSelection.range(urlFrom, urlFrom + placeholder.length),
      };
    }),
  );
  view.focus();
}

export const TABLE = [
  "| Column | Column |",
  "| --- | --- |",
  "| Cell | Cell |",
  "| Cell | Cell |",
].join("\n");

/** Ends the current slide and starts the next one. */
export const SLIDE_BREAK = "***";

/** Holds back everything after it until the next keypress. */
export const STEP = "<!-- step -->";

export const NOTES = "<!-- notes: -->";
