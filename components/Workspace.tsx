"use client";

import { useActiveTheme, useDeck } from "@/hooks/useDeck";
import { useHydrateDeck } from "@/hooks/useDeckLibrary";
import { useSlideNavigation } from "@/hooks/useSlideNavigation";
import { useDeckStore } from "@/lib/store";
import { EditorPane } from "./EditorPane";
import { PresenterMode } from "./PresenterMode";
import { PreviewPane } from "./PreviewPane";
import { PrintDeck } from "./PrintDeck";
import { Toolbar } from "./Toolbar";

/**
 * The editor workspace. Browser-only: decks are rendered and sanitized against
 * a real DOM, so this never runs during the static export's prerender.
 */
export function Workspace() {
  useHydrateDeck();

  const deck = useDeck();
  const theme = useActiveTheme(deck);
  const presenting = useDeckStore((state) => state.presenting);

  // Arrow keys drive the preview whenever the caret is not in the editor;
  // presenter mode binds its own copy of the same navigation.
  useSlideNavigation({ enabled: !presenting });

  return (
    <div className="app deck" data-theme={theme} data-transition={deck.meta.transition}>
      <Toolbar theme={theme} />

      <main className="panes">
        <EditorPane deck={deck} />
        <PreviewPane deck={deck} />
      </main>

      {presenting && <PresenterMode deck={deck} />}
      <PrintDeck deck={deck} theme={theme} />
    </div>
  );
}
