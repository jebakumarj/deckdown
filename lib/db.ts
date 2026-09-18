"use client";

/**
 * One IndexedDB database holds everything the app keeps: the user's decks and
 * the images they have pasted into them. localStorage is only used to remember
 * which deck was open last.
 */

const DB_NAME = "presentation-md";
const DB_VERSION = 2;

export const ASSET_STORE = "assets";
export const DECK_STORE = "decks";

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ASSET_STORE)) {
        db.createObjectStore(ASSET_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(DECK_STORE)) {
        const decks = db.createObjectStore(DECK_STORE, { keyPath: "id" });
        decks.createIndex("updatedAt", "updatedAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const request = run(tx.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function isStorageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Short, sortable-enough id for decks and assets. */
export function newId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}
