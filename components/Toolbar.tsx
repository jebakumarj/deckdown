"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Deck } from "@/lib/deck";
import { THEMES, useDeckStore } from "@/lib/store";
import { useDeleteDeck } from "@/hooks/useDeck";
import { deckTitle } from "@/lib/decks";
import { DeckLibrary } from "./DeckLibrary";
import { ChevronIcon, DocIcon, TrashIcon } from "./icons";
import { siteUrl } from "@/lib/host";
import { exportPdf } from "@/lib/export/pdf";
import { downloadDeckZip } from "@/lib/export/zip";
import { deckFilename, triggerDownload } from "@/lib/export/download";

export function Toolbar({ deck, theme }: { deck: Deck; theme: string }) {
  const source = useDeckStore((state) => state.source);
  const setSource = useDeckStore((state) => state.setSource);
  const themeOverride = useDeckStore((state) => state.themeOverride);
  const setThemeOverride = useDeckStore((state) => state.setThemeOverride);
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
      <a className="brand brand-link" href={siteUrl("/")} title="presentation.md home">
        presentation<span>.md</span>
      </a>
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

      <select
        className="select"
        value={themeOverride || deck.meta.theme}
        onChange={(event) => setThemeOverride(event.target.value)}
        aria-label="Theme"
      >
        {THEMES.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

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

      <button type="button" className="button" onClick={() => fileInput.current?.click()}>
        Open .md
      </button>

      <button
        type="button"
        className="button"
        onClick={() =>
          triggerDownload(
            new Blob([source], { type: "text/markdown;charset=utf-8" }),
            deckFilename(name, "md"),
          )
        }
      >
        Save .md
      </button>

      <button type="button" className="button" onClick={() => void downloadZip()} disabled={busy}>
        {busy ? "Zipping…" : "Download zip"}
      </button>

      <button type="button" className="button" onClick={() => void exportPdf()}>
        PDF
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

      <button type="button" className="button primary" onClick={() => setPresenting(true)}>
        Present
      </button>
    </header>
  );
}
