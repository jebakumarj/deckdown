"use client";

import { Landing } from "@/components/Landing";
import { Workspace } from "@/components/Workspace";
import { useIsClient } from "@/hooks/useIsClient";
import { isAppRoute } from "@/lib/host";

export default function Home() {
  // Both the pitch and the editor are browser-only: the editor renders decks
  // against a real DOM, and which of the two you get depends on the address.
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

  return isAppRoute() ? <Workspace /> : <Landing />;
}
