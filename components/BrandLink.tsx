/**
 * The wordmark, which always leads back to the promo page at the root — from
 * the editor, from the docs and from the promo page itself.
 *
 * A plain anchor on purpose: leaving the editor should drop it, rather than
 * carry its state into the promo page on a client-side navigation.
 */
export function BrandLink({ title = "deckdown home" }: { title?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a className="brand brand-link" href="/" title={title}>
      deck<span>down</span>
    </a>
  );
}
