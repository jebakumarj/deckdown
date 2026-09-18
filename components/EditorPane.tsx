"use client";

import { useCallback, useRef, useState } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import type { Deck } from "@/lib/deck";
import { slideIndexAtOffset } from "@/lib/deck";
import { putAsset } from "@/lib/assets";
import { useDeckStore } from "@/lib/store";

const extensions = [markdown(), EditorView.lineWrapping];

export function EditorPane({ deck }: { deck: Deck }) {
  const source = useDeckStore((state) => state.source);
  const setSource = useDeckStore((state) => state.setSource);
  const goToSlide = useDeckStore((state) => state.goToSlide);
  const addAssets = useDeckStore((state) => state.addAssets);

  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [dropActive, setDropActive] = useState(false);

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
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            autocompletion: false,
          }}
          onChange={setSource}
          onUpdate={(update) => {
            if (!update.selectionSet && !update.docChanged) return;
            const offset = update.state.selection.main.head;
            const index = slideIndexAtOffset(deck, offset);
            if (index !== useDeckStore.getState().currentSlide) goToSlide(index);
          }}
        />
      </div>
      <div className="editor-hint">
        <span>
          <code>***</code> new slide
        </span>
        <span>
          <code>&lt;!-- step --&gt;</code> reveal
        </span>
        <span>
          <code>&lt;!-- notes: … --&gt;</code> speaker notes
        </span>
        <span>drop or paste an image to embed it</span>
      </div>
    </section>
  );
}
