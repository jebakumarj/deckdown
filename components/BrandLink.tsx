"use client";

import { useIsClient } from "@/hooks/useIsClient";
import { siteUrl } from "@/lib/host";

/**
 * The wordmark, which always leads back to the promo page — from the editor,
 * from the docs and from the promo page itself.
 *
 * The href is only right once we know the host we are on, so the prerender
 * emits a plain "/" and the browser fills in the real URL after hydration.
 */
export function BrandLink({ title = "deckdown home" }: { title?: string }) {
  const isClient = useIsClient();

  return (
    <a className="brand brand-link" href={isClient ? siteUrl("/") : "/"} title={title}>
      deck<span>down</span>
    </a>
  );
}
