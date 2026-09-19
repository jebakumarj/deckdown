"use client";

import { ASSET_STORE, isStorageAvailable, newId, withStore } from "./db";

/**
 * Uploaded images live in IndexedDB (localStorage is a ~5 MB string store and
 * would overflow immediately). Decks reference them as `asset:<id>`.
 */

export interface AssetRecord {
  id: string;
  name: string;
  type: string;
  blob: Blob;
  createdAt: number;
}

const MAX_EDGE = 2000;

export async function putAsset(file: File | Blob, name = "image"): Promise<AssetRecord> {
  const blob = await downscale(file);
  const record: AssetRecord = {
    id: newId(),
    name: "name" in file && file.name ? file.name : name,
    type: blob.type || "image/png",
    blob,
    createdAt: Date.now(),
  };
  await withStore(ASSET_STORE, "readwrite", (store) => store.put(record) as IDBRequest<IDBValidKey>);
  return record;
}

export async function getAllAssets(): Promise<AssetRecord[]> {
  if (!isStorageAvailable()) return [];
  try {
    return await withStore(ASSET_STORE, "readonly", (store) => store.getAll() as IDBRequest<AssetRecord[]>);
  } catch {
    return [];
  }
}

/** Every `asset:<id>` referenced by a deck source. */
export function collectAssetIds(source: string): Set<string> {
  const ids = new Set<string>();
  for (const match of source.matchAll(/asset:([A-Za-z0-9_-]+)/g)) ids.add(match[1]);
  return ids;
}

export function assetExtension(type: string): string {
  const known: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };
  return known[type] ?? "png";
}

/** Shrinks oversized bitmaps so decks, zips and PDFs stay manageable. */
async function downscale(file: File | Blob): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_EDGE) {
      bitmap.close();
      return file;
    }

    const scale = MAX_EDGE / longest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, 0.92),
    );
    return resized ?? file;
  } catch {
    return file;
  }
}
