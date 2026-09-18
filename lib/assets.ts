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

const DB_NAME = "presentation-md";
const DB_VERSION = 1;
const STORE = "assets";
const MAX_EDGE = 2000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function newAssetId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export async function putAsset(file: File | Blob, name = "image"): Promise<AssetRecord> {
  const blob = await downscale(file);
  const record: AssetRecord = {
    id: newAssetId(),
    name: "name" in file && file.name ? file.name : name,
    type: blob.type || "image/png",
    blob,
    createdAt: Date.now(),
  };
  await withStore("readwrite", (store) => store.put(record) as IDBRequest<IDBValidKey>);
  return record;
}

export async function getAllAssets(): Promise<AssetRecord[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    return await withStore("readonly", (store) => store.getAll() as IDBRequest<AssetRecord[]>);
  } catch {
    return [];
  }
}

export async function deleteAssets(ids: string[]): Promise<void> {
  for (const id of ids) {
    await withStore("readwrite", (store) => store.delete(id) as IDBRequest<undefined>);
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
