"use client";

import { useEffect, useState } from "react";

/** Appears once the page has been scrolled, and returns the reader to the top. */
export function ScrollToTop({ showAfter = 400 }: { showAfter?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <button
      type="button"
      className={visible ? "scroll-top is-visible" : "scroll-top"}
      // Faded out rather than removed: taking a focused button out of the page
      // moves focus mid-flight, which cancels the smooth scroll it started.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 12.5V4M8 4 4.25 7.75M8 4l3.75 3.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
