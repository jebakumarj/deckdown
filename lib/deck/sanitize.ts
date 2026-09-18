import DOMPurify from "dompurify";

// DOMPurify's default scheme list rejects `blob:`, which is what uploaded
// images resolve to in the browser.
const ALLOWED_URI_REGEXP =
  /^(?:(?:blob|https?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Slides may contain raw HTML, so every rendered slide is sanitized before it
 * reaches `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(html: string): string {
  if (!DOMPurify.isSupported) {
    throw new Error(
      "sanitizeHtml requires a DOM; render slides in the browser or a DOM-backed environment.",
    );
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_URI_REGEXP,
    ADD_ATTR: ["target", "data-missing-asset"],
  });
}
