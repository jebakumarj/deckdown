"use client";

import { useEffect } from "react";
import { Workspace } from "@/components/Workspace";
import { useIsClient } from "@/hooks/useIsClient";
import { appUrl, isAppHost, isSingleOrigin } from "@/lib/host";

/**
 * Every deck has its own URL — `/monday-standup.md`. Those paths are not files
 * in the static export, so the host falls back to this page, which opens the
 * deck named in the path (see `useHydrateDeck`).
 *
 * On the marketing origin a deck URL belongs to the app, so we hand it over.
 */
export default function DeckRoute() {
  const isClient = useIsClient();
  const belongsHere = !isClient || isAppHost() || isSingleOrigin();

  useEffect(() => {
    if (isClient && !belongsHere) {
      window.location.replace(appUrl(window.location.pathname + window.location.search));
    }
  }, [isClient, belongsHere]);

  if (!isClient || !belongsHere) {
    return (
      <div className="app">
        <header className="toolbar">
          <span className="brand">
            presentation<span>.md</span>
          </span>
        </header>
        <main className="panes" />
      </div>
    );
  }

  return <Workspace />;
}
