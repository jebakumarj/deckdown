"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useDeckStore } from "@/lib/store";
import { useDeleteDeck } from "@/hooks/useDeckLibrary";
import { deckTitle } from "@/lib/storage/decks";
import { DeckLibrary } from "./DeckLibrary";
import { BrandLink } from "./BrandLink";
import {
  ChevronIcon,
  DocIcon,
  DownloadIcon,
  OpenIcon,
  PlayIcon,
  PrintIcon,
  SaveIcon,
  TrashIcon,
} from "./icons";
import { exportPdf } from "@/lib/export/pdf";
import { downloadDeckZip } from "@/lib/export/zip";
import { deckFilename, triggerDownload } from "@/lib/export/download";

export function Toolbar({ theme }: { theme: string }) {
  const source = useDeckStore((state) => state.source);
  const setSource = useDeckStore((state) => state.setSource);
  const setPresenting = useDeckStore((state) => state.setPresenting);
  const assets = useDeckStore((state) => state.assets);

  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const deleteDeck = useDeleteDeck();
  // The same name the deck is filed under in the library.
  const name = deckTitle(source);

  const importMarkdown = async (file: File | undefined) => {
    if (!file) return;
    setSource(await file.text());
    useDeckStore.getState().goToSlide(0);
  };

  const downloadZip = async () => {
    setBusy(true);
    try {
      await downloadDeckZip(source, theme, assets, name);
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="toolbar">
      <BrandLink />
      <span className="deck-switcher">
        <button
          type="button"
          className="deck-title"
          aria-expanded={libraryOpen}
          title="Your presentations"
          onClick={() => setLibraryOpen((open) => !open)}
        >
          {name}
          <ChevronIcon />
        </button>
        {libraryOpen && <DeckLibrary onClose={() => setLibraryOpen(false)} />}
      </span>

      <span className="spacer" />

      <input
        ref={fileInput}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        className="visually-hidden"
        onChange={(event) => {
          void importMarkdown(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        className="button icon"
        title="Open a markdown file"
        aria-label="Open a markdown file"
        onClick={() => fileInput.current?.click()}
      >
        <OpenIcon />
      </button>

      <button
        type="button"
        className="button icon"
        title="Save the markdown file"
        aria-label="Save the markdown file"
        onClick={() =>
          triggerDownload(
            new Blob([source], { type: "text/markdown;charset=utf-8" }),
            deckFilename(name, "md"),
          )
        }
      >
        <SaveIcon />
      </button>

      <button
        type="button"
        className="button icon"
        title={busy ? "Zipping…" : "Download the deck as a zip"}
        aria-label={busy ? "Zipping…" : "Download the deck as a zip"}
        onClick={() => void downloadZip()}
        disabled={busy}
      >
        <DownloadIcon />
      </button>

      <button
        type="button"
        className="button icon"
        title="Export a PDF via the print dialog"
        aria-label="Export a PDF"
        onClick={() => void exportPdf()}
      >
        <PrintIcon />
      </button>

      <button
        type="button"
        className="button icon danger"
        title="Delete this presentation"
        aria-label="Delete this presentation"
        onClick={() => void deleteDeck()}
      >
        <TrashIcon />
      </button>

      <Link
        href="/docs"
        prefetch={false}
        target="_blank"
        rel="noopener"
        className="button icon"
        title="How to write a deck"
        aria-label="Documentation"
      >
        <DocIcon />
      </Link>

      <button
        type="button"
        className="button primary icon"
        title="Present fullscreen"
        aria-label="Present fullscreen"
        onClick={() => setPresenting(true)}
      >
        <PlayIcon />
      </button>
    </header>
  );
}
