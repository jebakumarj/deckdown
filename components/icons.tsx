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

export function OpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.9 12.6V3.6a.6.6 0 0 1 .6-.6h3.3l1.5 1.7h4.2a.6.6 0 0 1 .6.6v1.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 12.6 4.9 7.5a.6.6 0 0 1 .58-.43h8.2a.6.6 0 0 1 .58.77l-1.32 4.5a.6.6 0 0 1-.58.43H2.5a.6.6 0 0 1-.6-.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v7.4M8 9.4 5.2 6.6M8 9.4l2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 10.9v1.75a.75.75 0 0 0 .75.75h9a.75.75 0 0 0 .75-.75V10.9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The classic save glyph: a disk with a label and a shutter. */
export function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.6 3.2a.6.6 0 0 1 .6-.6h7.3l2.9 2.9v7.3a.6.6 0 0 1-.6.6H3.2a.6.6 0 0 1-.6-.6V3.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 2.6h5v3.1h-5V2.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M4.6 9.1h6.8v4.3H4.6V9.1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A printer: PDF export goes through the browser's print dialog. */
export function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.6 6.1V2.9a.4.4 0 0 1 .4-.4h6a.4.4 0 0 1 .4.4v3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M4.6 11.4H3.1a.6.6 0 0 1-.6-.6V6.7a.6.6 0 0 1 .6-.6h9.8a.6.6 0 0 1 .6.6v4.1a.6.6 0 0 1-.6.6h-1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M4.6 9.9h6.8v3.2a.4.4 0 0 1-.4.4H5a.4.4 0 0 1-.4-.4V9.9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.4 3.4 12 8l-6.6 4.6V3.4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
