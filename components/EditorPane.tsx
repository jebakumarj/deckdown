"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { usePrefersDark } from "@/hooks/useColorScheme";
import { highlightActiveLineWhenCollapsed } from "@/lib/editor/activeLine";
import { headingLevelAt } from "@/lib/editor/commands";
import { vsCodeDark, vsCodeLight } from "@/lib/editor/theme";
import type { Deck } from "@/lib/deck";
import { slideIndexAtOffset } from "@/lib/deck";
import { putAsset } from "@/lib/storage/assets";
import { useDeckStore } from "@/lib/store";
import { EditorToolbar } from "./EditorToolbar";

// Fenced code blocks get real syntax highlighting, loaded on demand per language.
const baseExtensions = [
  markdown({ codeLanguages: languages }),
  EditorView.lineWrapping,
  highlightActiveLineWhenCollapsed,
];

export function EditorPane({ deck }: { deck: Deck }) {
  const source = useDeckStore((state) => state.source);
  const setSource = useDeckStore((state) => state.setSource);
  const goToSlide = useDeckStore((state) => state.goToSlide);
  const addAssets = useDeckStore((state) => state.addAssets);

  const prefersDark = usePrefersDark();
  const extensions = useMemo(
    () => [...baseExtensions, prefersDark ? vsCodeDark : vsCodeLight],
    [prefersDark],
  );

  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const [dropActive, setDropActive] = useState(false);
  // Drives the toolbar's heading stepper, so it follows the caret.
  const [headingLevel, setHeadingLevel] = useState<number | null>(null);

  /** Stores dropped/pasted images and writes an `asset:` reference at the caret. */
  const insertImages = useCallback(
    async (files: File[]) => {
      const images = files.filter((file) => file.type.startsWith("image/"));
      if (images.length === 0) return;

      const entries = [];
      for (const file of images) {
        const record = await putAsset(file);
        entries.push({ record, url: URL.createObjectURL(record.blob) });
      }
      addAssets(entries);

      const view = editorRef.current?.view;
      const snippet = entries
        .map((entry) => `![${entry.record.name.replace(/\.[^.]+$/, "")}](asset:${entry.record.id})`)
        .join("\n\n");

      if (view) {
        const at = view.state.selection.main.head;
        view.dispatch({
          changes: { from: at, insert: `\n\n${snippet}\n` },
          selection: { anchor: at + snippet.length + 3 },
        });
        view.focus();
      } else {
        setSource(`${useDeckStore.getState().source}\n\n${snippet}\n`);
      }
    },
    [addAssets, setSource],
  );

  return (
    <section className={`pane editor${dropActive ? " drop-active" : ""}`}>
      <EditorToolbar
        getView={() => editorRef.current?.view ?? null}
        headingLevel={headingLevel}
        onInsertImage={() => imageInput.current?.click()}
      />

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(event) => {
          void insertImages(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <div
        className="editor-scroll"
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setDropActive(true);
          }
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(event) => {
          if (event.dataTransfer.files.length === 0) return;
          event.preventDefault();
          setDropActive(false);
          void insertImages(Array.from(event.dataTransfer.files));
        }}
        onPaste={(event) => {
          const files = Array.from(event.clipboardData.files);
          if (files.length === 0) return;
          event.preventDefault();
          void insertImages(files);
        }}
      >
        <CodeMirror
          ref={editorRef}
          value={source}
          extensions={extensions}
          theme="none"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            autocompletion: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: true,
            bracketMatching: true,
            closeBrackets: false,
          }}
          onChange={setSource}
          onUpdate={(update) => {
            if (!update.selectionSet && !update.docChanged) return;
            const offset = update.state.selection.main.head;
            const index = slideIndexAtOffset(deck, offset);
            if (index !== useDeckStore.getState().currentSlide) goToSlide(index);
            setHeadingLevel(headingLevelAt(update.state));
          }}
        />
      </div>
    </section>
  );
}
