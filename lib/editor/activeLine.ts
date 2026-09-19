"use client";

import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";

const lineDeco = Decoration.line({ class: "cm-activeLine" });

/**
 * The active-line highlight, dropped as soon as anything is selected.
 *
 * CodeMirror's own version keeps it, and draws the selection in a layer at
 * `z-index: -1` — underneath the line backgrounds. Its default highlight is
 * translucent so the selection still shows through; ours is an opaque VS Code
 * grey, which would hide a double-clicked word completely. VS Code itself
 * drops the current-line highlight while there is a selection, so we do too.
 */
function activeLineDeco(view: EditorView): DecorationSet {
  if (view.state.selection.ranges.some((range) => !range.empty)) return Decoration.none;

  const deco = [];
  let lastLineStart = -1;
  for (const range of view.state.selection.ranges) {
    const line = view.lineBlockAt(range.head);
    if (line.from > lastLineStart) {
      deco.push(lineDeco.range(line.from));
      lastLineStart = line.from;
    }
  }
  return Decoration.set(deco);
}

export const highlightActiveLineWhenCollapsed = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = activeLineDeco(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = activeLineDeco(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
