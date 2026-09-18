# Contributing

Thanks for helping out. deckdown is a small, deliberately minimal app;
the bar for a change is that a deck stays easy to write and easy to read.

## Getting started

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm test
npm run lint
npm run build
```

## Where things go

- **Deck syntax and rendering** live in `lib/deck/`. This module must not import
  React or anything from `next/` — it also has to run in a plain Node or server
  context. Every syntax change needs a test in `lib/deck/__tests__/`.
- **Export formats** live in `lib/export/`. The zip's `index.html` must keep
  working offline with no network requests.
- **Themes** are plain CSS files in `themes/` that define the same set of custom
  properties. A new theme means one new file, one entry in `THEMES` in
  `lib/store.ts`, and one `@import` in `app/globals.css`.
- **UI** lives in `components/` and `hooks/`.

## Design principles

- Markdown stays readable as markdown. No directive soup.
- Sensible defaults over options. A deck with no front matter should look good.
- No backend, no accounts, no telemetry in the client app.
- Slides must render identically in the preview, presenter mode, the exported
  HTML player and the PDF — they all share `themes/slide.css`.

## Reporting bugs

Include the markdown source that reproduces it. A deck is a plain text file, so
paste it straight into the issue.
