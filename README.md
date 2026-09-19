# deckdown

Write markdown, get a beautiful minimal slide deck. Type in the left pane, watch
the slideshow build itself on the right, then present it, export a PDF, or take
the whole deck away as a zip.

Everything runs in your browser. There is no account, no server and no upload:
your decks live in this browser's storage and in the files you export.

## Features

- **Live slideshow preview** as you type, with a filmstrip of every slide
- **Presenter mode** — fullscreen, keyboard driven, with speaker notes
- **Fragments** that reveal parts of a slide one keypress at a time
- **Code highlighting and LaTeX math**, via highlight.js and KaTeX
- **Three minimal themes** (light, dark, serif) and fade/slide transitions
- **Images** by drag, drop or paste — stored locally, packaged on export
- **PDF export** of the rendered slides, one landscape page per slide
- **Zip download** containing the markdown, the images, and a self-contained
  HTML player that presents offline from a double-click

## Writing a deck

````markdown
---
title: My Talk
author: Jane
theme: minimal-light
transition: fade
---

<!-- layout: center -->

# My Talk

***

## A second slide

- always visible
<!-- step -->
- revealed on the next keypress

![diagram](asset:9f3a1c)

<!-- notes: only visible in presenter mode -->
````

| Syntax | Meaning |
| --- | --- |
| `---` block at the top | Deck metadata: `title`, `author`, `theme`, `transition` |
| `***` on its own line | Start a new slide (needs a blank line before it) |
| `<!-- step -->` | Split a slide into reveals |
| `<!-- notes: … -->` | Speaker notes for the current slide |
| `<!-- layout: center \| full \| default -->` | Layout for the current slide |
| `asset:<id>` | An image you dropped or pasted into the editor |

Themes are `minimal-light`, `minimal-dark` and `serif`; transitions are `none`,
`fade` and `slide`. Transitions respect `prefers-reduced-motion`.

## Keyboard

| Key | Action |
| --- | --- |
| `→` `↓` `Space` `Enter` | Next fragment, then next slide |
| `←` `↑` `Backspace` | Back |
| `Home` / `End` | First / last slide |
| `S` | Toggle speaker notes |
| `Esc` | Leave presenter mode |

Arrow keys drive the preview whenever the caret is not in the editor.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # parser and renderer unit tests
npm run lint
npm run build   # static export to ./out
```

Next.js + TypeScript, with no backend. `npm run build` produces a fully static
site you can host anywhere — Vercel, Netlify, an S3 bucket.

### Hosting

One origin serves both faces of the app: `/` is the promo page, and every other
root-level path is a deck open in the editor — `/monday-standup`. Deck paths are
not files in the export, so the host has to answer them with the app shell:
[`vercel.json`](vercel.json) rewrites them to `index.html`, and
[`public/_redirects`](public/_redirects) does the same on Netlify. Without a
rule like that a deck URL still works, because the export's `404.html` is the
same app, but it is served with a 404 status.

### Layout

| Path | What lives there |
| --- | --- |
| `lib/deck/` | Framework-free parser and renderer: front matter, slide splitting, markdown, sanitizing |
| `lib/export/` | Zip bundle, standalone HTML player, PDF/print helpers |
| `lib/storage/` | Decks and images in IndexedDB |
| `lib/store.ts` | App state and debounced autosave |
| `components/`, `hooks/` | The editor UI |
| `themes/` | Slide layout, themes, transitions, print stylesheet |

`lib/deck/` deliberately imports nothing from React or Next, so the same code can
render decks in a future server route.

## License

MIT — see [LICENSE](LICENSE).
