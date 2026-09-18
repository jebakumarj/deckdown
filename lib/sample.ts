export const SAMPLE_DECK = `---
title: deckdown
author: you
theme: minimal-light
transition: fade
---

<!-- layout: center -->

# deckdown

Beautiful slides from plain markdown.

<!-- notes: Welcome everyone. This whole deck is one markdown file. -->

***

## How it works

Write markdown on the left, watch the deck on the right.

- Separate slides with \`***\` on its own line
- Front matter sets the title, theme and transition
- Everything is saved in your browser

***

## Reveal things one at a time

Put \`<!-- step -->\` between blocks.

<!-- step -->

- First this appears
<!-- step -->
- then this
<!-- step -->
- and finally this.

***

## Code and math are first class

\`\`\`ts
export function greet(name: string) {
  return \`Hello, \${name}\`;
}
\`\`\`

Inline math like $e^{i\\pi} + 1 = 0$ works, and so do display blocks:

$$\\int_0^1 x^2 \\,dx = \\tfrac{1}{3}$$

***

<!-- layout: center -->

## Take it with you

Present it, export a PDF, or download the whole deck as a zip.

<!-- notes: Press S in presenter mode to see notes like this one. -->
`;
