/** Shared line icons, drawn on a 16px grid unless noted. */

export function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.25 4.5h9.5M6.5 4.5V3.25h3V4.5M4.75 4.5l.6 8.1a.75.75 0 0 0 .75.65h3.8a.75.75 0 0 0 .75-.65l.6-8.1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 1.75h4.5L12.25 5.5v8.75a.5.5 0 0 1-.5.5h-7.5a.5.5 0 0 1-.5-.5V2.25a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8.25 2v3.25h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path
        d="M5.9 8.4h4.2M5.9 10.8h4.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M2 3.75 5 6.75l3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** A slide: 4:3-ish rectangle with lines of text. */
export function SlideIcon({ width = 26, height = 20 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 34 26" fill="none" aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="32.5"
        height="24.5"
        rx="3.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 8.5h13M6.5 13h21M6.5 17.5h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
