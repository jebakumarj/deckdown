"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during the static prerender, true once mounted in the browser. Used to
 * keep DOM-only work (deck rendering, sanitizing, portals) off the server pass.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
