"use client";

import Link from "next/link";
import { BrandLink } from "./BrandLink";

const FEATURES = [
  {
    title: "Write, don't arrange",
    body: "Type markdown on the left; the deck builds itself on the right. No text boxes to nudge.",
  },
  {
    title: "Present from anywhere",
    body: "Fullscreen playback with speaker notes, reveals and keyboard navigation.",
  },
  {
    title: "Yours to keep",
    body: "Export the markdown, a PDF, or a zip that presents offline. Nothing is uploaded.",
  },
];

/** Single-screen pitch, shown on the marketing host. */
export function Landing() {
  return (
    <div className="landing">
      <header className="landing-top">
        <BrandLink />
        <Link className="landing-doclink" href="/docs" prefetch={false}>
          Docs
        </Link>
      </header>

      <main className="landing-main">
        <p className="landing-eyebrow">Markdown in, slides out</p>
        <h1>
          Beautiful decks from
          <br />
          plain markdown.
        </h1>
        <p className="landing-lead">
          A minimal presentation editor that runs entirely in your browser. Write a talk the way you
          write a README, then present it, print it, or take it away as a single file.
        </p>

        <div className="landing-actions">
          {/* Both open the editor, which wants a document of its own. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="button primary large" href="/?app=1">
            Open the app
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="button large" href="/?new=1">
            New presentation
          </a>
        </div>

        <ul className="landing-features">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="landing-bottom">
        <span>Free and open source, MIT licensed.</span>
        <span className="landing-sep">·</span>
        <span>No account, no server, no tracking.</span>
      </footer>
    </div>
  );
}
