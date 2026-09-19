"use client";

import { useState } from "react";
import type { EditorView } from "@codemirror/view";
import {
  BULLET,
  insertBlock,
  insertLink,
  MAX_HEADING,
  NOTES,
  NUMBERED,
  QUOTE,
  setHeadingLevel,
  SLIDE_BREAK,
  STEP,
  TABLE,
  toggleHeading,
  toggleLinePrefix,
  toggleWrap,
} from "@/lib/editor/commands";
import {
  BoldIcon,
  BulletListIcon,
  ChevronIcon,
  CodeIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  NotesIcon,
  NumberedListIcon,
  QuoteIcon,
  SlideBreakIcon,
  StepIcon,
  TableIcon,
} from "./icons";

interface Tool {
  label: string;
  icon: React.ReactNode;
  run: (view: EditorView) => void;
}

/** Tools in groups: inline marks, block structure, inserts, deck directives. */
const GROUPS: Tool[][] = [
  [
    { label: "Bold", icon: <BoldIcon />, run: (view) => toggleWrap(view, "**") },
    { label: "Italic", icon: <ItalicIcon />, run: (view) => toggleWrap(view, "_") },
    { label: "Inline code", icon: <CodeIcon />, run: (view) => toggleWrap(view, "`") },
  ],
  [
    { label: "Bullet list", icon: <BulletListIcon />, run: (view) => toggleLinePrefix(view, BULLET) },
    { label: "Numbered list", icon: <NumberedListIcon />, run: (view) => toggleLinePrefix(view, NUMBERED) },
    { label: "Quote", icon: <QuoteIcon />, run: (view) => toggleLinePrefix(view, QUOTE) },
  ],
  [
    { label: "Link", icon: <LinkIcon />, run: insertLink },
    { label: "Table", icon: <TableIcon />, run: (view) => insertBlock(view, TABLE) },
  ],
  [
    { label: "New slide", icon: <SlideBreakIcon />, run: (view) => insertBlock(view, SLIDE_BREAK) },
    { label: "Reveal", icon: <StepIcon />, run: (view) => insertBlock(view, STEP) },
    { label: "Speaker notes", icon: <NotesIcon />, run: (view) => insertBlock(view, NOTES) },
  ],
];

interface EditorToolbarProps {
  /** The live editor, or null before it has mounted. */
  getView: () => EditorView | null;
  /** The heading level under the caret, or null on a line of body text. */
  headingLevel: number | null;
  /** Opens the file picker; images are stored and referenced at the caret. */
  onInsertImage: () => void;
}

/** Markdown formatting for people who would rather not remember the syntax. */
export function EditorToolbar({ getView, headingLevel, onInsertImage }: EditorToolbarProps) {
  // On a heading, the stepper shows that heading's level; on body text it
  // shows the level the H button would apply, which is wherever it was left.
  const [chosenLevel, setChosenLevel] = useState(2);
  const level = headingLevel ?? chosenLevel;

  /** Steps the level; on a heading line the line itself moves with it. */
  const step = (delta: number) => {
    const next = Math.min(MAX_HEADING, Math.max(1, level + delta));
    setChosenLevel(next);
    const view = getView();
    if (view && headingLevel) setHeadingLevel(view, next);
  };

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
      {GROUPS.map((group, index) => (
        <span className="editor-tools" key={index}>
          {index > 0 && <span className="editor-tool-sep" aria-hidden="true" />}
          {index === 1 && (
            <span className="editor-heading">
              <button
                type="button"
                className="editor-tool has-level"
                title={`Heading ${level}`}
                aria-label={`Heading ${level}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const view = getView();
                  if (view) toggleHeading(view, level);
                }}
              >
                <HeadingIcon />
                <span className="editor-tool-level">{level}</span>
              </button>

              <span className="editor-heading-steps">
                <button
                  type="button"
                  className="editor-step is-up"
                  title="Bigger heading"
                  aria-label="Bigger heading"
                  disabled={level === 1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => step(-1)}
                >
                  <ChevronIcon />
                </button>
                <button
                  type="button"
                  className="editor-step"
                  title="Smaller heading"
                  aria-label="Smaller heading"
                  disabled={level === MAX_HEADING}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => step(1)}
                >
                  <ChevronIcon />
                </button>
              </span>
            </span>
          )}
          {group.map((tool) => (
            <button
              key={tool.label}
              type="button"
              className="editor-tool"
              title={tool.label}
              aria-label={tool.label}
              // The editor keeps its selection: the toolbar never takes focus.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const view = getView();
                if (view) tool.run(view);
              }}
            >
              {tool.icon}
            </button>
          ))}
        </span>
      ))}

      <span className="editor-tool-sep" aria-hidden="true" />
      <button
        type="button"
        className="editor-tool"
        title="Insert an image"
        aria-label="Insert an image"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onInsertImage}
      >
        <ImageIcon />
      </button>
    </div>
  );
}
