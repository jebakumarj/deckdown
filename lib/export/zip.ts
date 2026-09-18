"use client";

import JSZip from "jszip";
import { renderDeck } from "@/lib/deck";
import { assetExtension, collectAssetIds } from "@/lib/assets";
import type { AssetEntry } from "@/lib/store";
import { collectDeckCss } from "./css";
import { buildStandaloneHtml } from "./standalone";
import { deckFilename, triggerDownload } from "./download";

const README = (title: string) => `${title}

This zip was exported from presentation.md.

  index.html   open it in any browser to present offline
               (arrow keys or space to advance, S for speaker notes, F for fullscreen)
  deck.md      the markdown source - paste it back into presentation.md to keep editing
  assets/      images used by the deck

Everything is self-contained; no internet connection is needed.
`;

/**
 * Bundles the deck as markdown, its images, and a self-contained HTML player.
 */
export async function downloadDeckZip(
  source: string,
  theme: string,
  assets: Record<string, AssetEntry>,
  name: string,
): Promise<void> {
  const zip = new JSZip();
  const usedIds = Array.from(collectAssetIds(source)).filter((id) => assets[id]);

  const paths = new Map<string, string>();
  for (const id of usedIds) {
    const entry = assets[id];
    const path = `assets/${id}.${assetExtension(entry.record.type)}`;
    paths.set(id, path);
    zip.file(path, entry.record.blob);
  }

  // The exported deck refers to files on disk rather than in-memory blob URLs.
  const portableSource = source.replace(
    /asset:([A-Za-z0-9_-]+)/g,
    (full, id: string) => paths.get(id) ?? full,
  );

  const deck = renderDeck(source, { resolveAsset: (id) => paths.get(id) });
  const css = await collectDeckCss();
  const html = buildStandaloneHtml(deck, theme, css);
  const title = deck.meta.title || name || "deck";

  zip.file("deck.md", portableSource);
  zip.file("index.html", html);
  zip.file("README.txt", README(title));

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, deckFilename(title, "zip"));
}
