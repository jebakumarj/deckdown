"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDeck, listDecks, UNTITLED, type DeckRecord } from "@/lib/decks";
import { useDeleteDeck, useNewDeck } from "@/hooks/useDeck";
import { useDeckStore } from "@/lib/store";
import { PlusIcon, SlideIcon, TrashIcon } from "./icons";

/**
 * The user's saved decks, listed inside the app — which is where the storage
 * they live in belongs. Opens as a panel under the deck name in the toolbar.
 */
export function DeckLibrary({ onClose }: { onClose: () => void }) {
  const [decks, setDecks] = useState<DeckRecord[] | null>(null);
  const openDeck = useDeckStore((state) => state.openDeck);
  const currentId = useDeckStore((state) => state.deckId);
  const newDeck = useNewDeck();
  const deleteDeck = useDeleteDeck();
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    listDecks().then(setDecks);
  }, []);

  useEffect(refresh, [refresh]);

  // Close on Escape or a click elsewhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) onClose();
    };

    window.addEventListener("keydown", onKey);
    // Deferred so the click that opened the panel does not immediately close it.
    const timer = setTimeout(() => window.addEventListener("pointerdown", onPointerDown), 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  const open = async (id: string) => {
    const record = await getDeck(id);
    if (record) openDeck(record);
    onClose();
  };

  // Same confirm, same "open what's left" behaviour as the toolbar button.
  const remove = async (deck: DeckRecord) => {
    if (await deleteDeck({ id: deck.id, title: deck.title || UNTITLED })) refresh();
  };

  return (
    <div className="deck-library" ref={panelRef} role="dialog" aria-label="Your presentations">
      <div className="deck-library-head">
        <span>Your presentations</span>
        <span className="deck-library-count">{decks ? decks.length : ""}</span>
      </div>

      <button
        type="button"
        className="deck-library-new"
        onClick={async () => {
          await newDeck();
          onClose();
        }}
      >
        <PlusIcon />
        New presentation
      </button>

      <ul>
        {decks?.map((deck) => (
          <li key={deck.id}>
            <button
              type="button"
              className="deck-library-item"
              aria-current={deck.id === currentId}
              onClick={() => void open(deck.id)}
            >
              <SlideIcon />
              <span className="deck-library-text">
                <span className="deck-library-name">{deck.title || UNTITLED}</span>
                <span className="deck-library-meta">
                  {deck.slideCount} {deck.slideCount === 1 ? "slide" : "slides"} ·{" "}
                  {relativeTime(deck.updatedAt)} · /{deck.slug}
                </span>
              </span>
            </button>
            <button
              type="button"
              className="deck-library-delete"
              title={`Delete ${deck.title || UNTITLED}`}
              aria-label={`Delete ${deck.title || UNTITLED}`}
              onClick={() => void remove(deck)}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>

      {decks?.length === 0 && <p className="deck-library-empty">No presentations yet.</p>}
    </div>
  );
}

function relativeTime(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
