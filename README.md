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
site you can host anywhere — GitHub Pages, Netlify, an S3 bucket.

### Hosting

By default the promo page and the editor are two hosts sharing one bundle:
`example.com` shows the pitch, `app.example.com` shows the editor. Two
environment variables adapt the build to hosts that cannot do that:

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SINGLE_ORIGIN=1` | Promo and editor share one origin; links to the app stay on it and carry `?app=1` |
| `NEXT_PUBLIC_BASE_PATH=/repo` | The site is served from a sub-path rather than a domain root |

### GitHub Pages

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
builds with both of those set and publishes the result. To use it:

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push the branch named in the workflow's `on.push.branches`, or run it from
   the Actions tab.

The workflow derives `NEXT_PUBLIC_BASE_PATH` from the repository name, which is
right for a project page at `user.github.io/repo`. For a custom domain or a
`user.github.io` site, set that variable to an empty string instead.

Deck URLs are not files, so Pages answers them with `404.html` — which is this
app, and which opens the deck named in the path. The URL works; the status code
is a 404 nobody sees.

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
