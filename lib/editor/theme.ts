"use client";

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";

/**
 * A VS Code flavoured editor: Dark+ and Light+ token colours, a quiet gutter,
 * and markdown structure that reads as structure rather than as decoration.
 */
interface Palette {
  background: string;
  foreground: string;
  caret: string;
  selection: string;
  selectionMatch: string;
  activeLine: string;
  gutterForeground: string;
  gutterActive: string;
  heading: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  variable: string;
  function: string;
  type: string;
  operator: string;
  punctuation: string;
  mark: string;
  link: string;
  invalid: string;
}

const dark: Palette = {
  background: "#1e1e1e",
  foreground: "#d4d4d4",
  caret: "#aeafad",
  selection: "#264f78",
  selectionMatch: "#3a3d41",
  activeLine: "#282828",
  gutterForeground: "#858585",
  gutterActive: "#c6c6c6",
  heading: "#569cd6",
  keyword: "#c586c0",
  string: "#ce9178",
  comment: "#6a9955",
  number: "#b5cea8",
  variable: "#9cdcfe",
  function: "#dcdcaa",
  type: "#4ec9b0",
  operator: "#d4d4d4",
  punctuation: "#808080",
  mark: "#6796e6",
  link: "#4e94ce",
  invalid: "#f44747",
};

const light: Palette = {
  background: "#ffffff",
  foreground: "#1f1f1f",
  caret: "#1f1f1f",
  selection: "#add6ff",
  selectionMatch: "#e4e6f1",
  activeLine: "#f3f3f3",
  gutterForeground: "#a0a0a0",
  gutterActive: "#3b3b3b",
  heading: "#0000ff",
  keyword: "#af00db",
  string: "#a31515",
  comment: "#008000",
  number: "#098658",
  variable: "#001080",
  function: "#795e26",
  type: "#267f99",
  operator: "#1f1f1f",
  punctuation: "#7a7a7a",
  mark: "#0451a5",
  link: "#0451a5",
  invalid: "#cd3131",
};

function buildTheme(palette: Palette, isDark: boolean): Extension {
  return EditorView.theme(
    {
      "&": {
        color: palette.foreground,
        backgroundColor: palette.background,
        fontSize: "14px",
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily:
          '"Cascadia Code", "JetBrains Mono", ui-monospace, Consolas, "Courier New", monospace',
        lineHeight: "1.6",
      },
      ".cm-content": {
        padding: "12px 0 40vh",
        caretColor: palette.caret,
      },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: palette.caret, borderLeftWidth: "2px" },
      "&.cm-focused": { outline: "none" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: palette.selection,
      },
      ".cm-selectionMatch": { backgroundColor: palette.selectionMatch },
      ".cm-activeLine": { backgroundColor: palette.activeLine },
      ".cm-gutters": {
        backgroundColor: palette.background,
        color: palette.gutterForeground,
        border: "none",
        paddingRight: "8px",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: palette.gutterActive,
      },
      ".cm-lineNumbers .cm-gutterElement": { padding: "0 4px 0 16px" },
      ".cm-matchingBracket, .cm-nonmatchingBracket": {
        backgroundColor: "transparent",
        outline: `1px solid ${palette.punctuation}`,
      },
      ".cm-tooltip": {
        backgroundColor: isDark ? "#252526" : "#f3f3f3",
        border: `1px solid ${isDark ? "#454545" : "#c8c8c8"}`,
        color: palette.foreground,
      },
    },
    { dark: isDark },
  );
}

function buildHighlight(palette: Palette): Extension {
  const style = HighlightStyle.define([
    // Markdown structure. Headings stay bold and coloured — never underlined.
    { tag: [t.heading, t.heading1, t.heading2, t.heading3], color: palette.heading, fontWeight: "bold" },
    { tag: [t.heading4, t.heading5, t.heading6], color: palette.heading, fontWeight: "bold" },
    { tag: t.strong, color: palette.foreground, fontWeight: "bold" },
    { tag: t.emphasis, color: palette.foreground, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: [t.link, t.url], color: palette.link, textDecoration: "none" },
    { tag: t.quote, color: palette.comment, fontStyle: "italic" },
    // Only the markers are coloured; list text stays body text, as in VS Code.
    { tag: t.list, color: palette.foreground },
    { tag: t.contentSeparator, color: palette.keyword, fontWeight: "bold" },
    { tag: t.monospace, color: palette.string },
    { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: palette.comment },
    { tag: [t.meta, t.processingInstruction], color: palette.mark },

    // Code inside fenced blocks, via @codemirror/language-data.
    { tag: [t.keyword, t.moduleKeyword, t.controlKeyword], color: palette.keyword },
    { tag: [t.string, t.special(t.string), t.regexp], color: palette.string },
    { tag: [t.number, t.bool, t.null, t.atom], color: palette.number },
    { tag: [t.variableName, t.propertyName, t.attributeName], color: palette.variable },
    { tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName], color: palette.function },
    { tag: [t.typeName, t.className, t.namespace, t.tagName], color: palette.type },
    { tag: [t.operator, t.operatorKeyword, t.definitionKeyword], color: palette.keyword },
    { tag: [t.punctuation, t.separator, t.bracket, t.paren, t.brace, t.squareBracket], color: palette.punctuation },
    { tag: [t.self, t.constant(t.variableName)], color: palette.variable },
    { tag: t.escape, color: palette.number },
    { tag: t.invalid, color: palette.invalid },
  ]);

  // Registered without `fallback`, so it outranks CodeMirror's default style
  // (the one that underlines headings and links).
  return syntaxHighlighting(style);
}

export const vsCodeDark: Extension = [buildTheme(dark, true), buildHighlight(dark)];
export const vsCodeLight: Extension = [buildTheme(light, false), buildHighlight(light)];
