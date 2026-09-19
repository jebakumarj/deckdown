import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "deckdown",
  description: "Write markdown, get a beautiful minimal slide deck.",
  applicationName: "deckdown",
  openGraph: {
    title: "deckdown",
    description: "Write markdown, get a beautiful minimal slide deck.",
    type: "website",
  },
};

// Matches --shell-bg in globals.css, so the browser chrome follows the app.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f2" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
