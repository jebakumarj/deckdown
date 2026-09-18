"use client";

import { Workspace } from "@/components/Workspace";
import { useIsClient } from "@/hooks/useIsClient";

export default function Home() {
  // The whole editor is browser-only, so the prerendered page is just a shell.
  if (!useIsClient()) {
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
