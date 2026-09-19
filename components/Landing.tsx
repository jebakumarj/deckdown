"use client";

import type { CSSProperties } from "react";
import { BrandLink } from "./BrandLink";
import { appUrl, assetUrl } from "@/lib/host";

// The backdrop lives in CSS, but its URL has to carry the deployment's base
// path, which only JavaScript knows.
const BACKDROP = {
  "--landing-light": `url(${assetUrl("/landing-light.svg")})`,
  "--landing-dark": `url(${assetUrl("/landing-dark.svg")})`,
} as CSSProperties;

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
    <div className="landing" style={BACKDROP}>
      <header className="landing-top">
        <BrandLink />
        <a className="landing-doclink" href={appUrl("/docs")}>
          Docs
        </a>
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
          <a className="button primary large" href={appUrl("/")}>
            Open the app
          </a>
          <a className="button large" href={appUrl("/?new=1")}>
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
