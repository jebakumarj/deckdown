"use client";

import { Workspace } from "@/components/Workspace";
import { useIsClient } from "@/hooks/useIsClient";

/**
 * Every deck has its own URL — `/monday-standup`. Those paths are not files in
 * the static export, so the host falls back to this page, which opens the deck
 * named in the path (see `useHydrateDeck`).
 */
export default function DeckRoute() {
  if (!useIsClient()) {
    return (
      <div className="app">
        <header className="toolbar">
          <span className="brand">
            deck<span>down</span>
          </span>
        </header>
        <main className="panes" />
      </div>
    );
  }

  return <Workspace />;
}
