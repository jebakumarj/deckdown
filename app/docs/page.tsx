import type { Metadata } from "next";
import Link from "next/link";
import { DocsNav, type DocsSection } from "@/components/DocsNav";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Writing decks · presentation.md",
  description:
    "How to write a presentation in markdown: slides, reveals, speaker notes, images, themes.",
};

// Built by hand so the fence characters can appear literally in the examples.
const FENCE = "```";

const slideExample = ["# First slide", "", "Some words.", "", "***", "", "# Second slide"].join("\n");

const frontMatterExample = [
  "---",
  "title: My Talk",
  "author: Jane Doe",
  "theme: minimal-light",
  "transition: fade",
  "---",
].join("\n");

const stepExample = [
  "## The plan",
  "",
  "- This is on screen straight away",
  "<!-- step -->",
  "- This waits for one keypress",
  "<!-- step -->",
  "- And this waits for another",
].join("\n");

const notesExample = [
  "# Results",
  "",
  "<!-- notes: Pause here. Ask the room what they expected. -->",
].join("\n");

const layoutExample = ["<!-- layout: center -->", "", "# A title slide"].join("\n");

const imageExample = "![a diagram](asset:9f3a1c)";

const codeExample = [
  FENCE + "python",
  "def greet(name):",
  '    return f"Hello, {name}"',
  FENCE,
].join("\n");

const mathExample = [
  String.raw`Euler: $e^{i\pi} + 1 = 0$`,
  "",
  String.raw`$$\int_0^1 x^2 \,dx = \tfrac{1}{3}$$`,
].join("\n");

const SECTIONS: DocsSection[] = [
  { id: "slides", label: "Slides" },
  { id: "front-matter", label: "Front matter" },
  { id: "reveals", label: "Reveals" },
  { id: "notes", label: "Speaker notes" },
  { id: "layouts", label: "Layouts" },
  { id: "images", label: "Images" },
  { id: "code-and-math", label: "Code and math" },
  { id: "presenting", label: "Presenting" },
  { id: "exporting", label: "Exporting" },
  { id: "tips", label: "Tips" },
];

function Example({ children }: { children: string }) {
  return (
    <pre className="docs-example">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="docs">
      <header className="docs-header">
        <span className="brand">
          presentation<span>.md</span>
        </span>
        <Link href="/" prefetch={false} className="button">
          Back to the editor
        </Link>
      </header>

      <div className="docs-layout">
        <DocsNav sections={SECTIONS} />

        <main className="docs-body">
        <h1>Writing a deck</h1>
        <p className="docs-lead">
          A presentation is one markdown file. Type it on the left of the editor and the slideshow
          builds itself on the right. Nothing is uploaded anywhere: your deck is saved in this
          browser and in the files you export.
        </p>


        <section id="slides">
          <h2>Slides</h2>
          <p>Three asterisks on their own line start a new slide. Leave a blank line before them.</p>
          <Example>{slideExample}</Example>
          <p className="docs-note">
            A <code>---</code> line is an ordinary horizontal rule and does not split slides, so you
            can still draw one inside a slide.
          </p>
        </section>

        <section id="front-matter">
          <h2>Front matter</h2>
          <p>
            An optional block at the very top of the file, fenced by <code>---</code>, describes the
            deck. Every field is optional.
          </p>
          <Example>{frontMatterExample}</Example>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Values</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>title</code>
                </td>
                <td>any text</td>
                <td>Names the deck, and names the files you export</td>
              </tr>
              <tr>
                <td>
                  <code>author</code>
                </td>
                <td>any text</td>
                <td>Recorded with the deck</td>
              </tr>
              <tr>
                <td>
                  <code>theme</code>
                </td>
                <td>
                  <code>minimal-light</code>, <code>minimal-dark</code>, <code>serif</code>
                </td>
                <td>Picks the look. The toolbar theme picker overrides it while you edit</td>
              </tr>
              <tr>
                <td>
                  <code>transition</code>
                </td>
                <td>
                  <code>none</code>, <code>fade</code>, <code>slide</code>
                </td>
                <td>How one slide gives way to the next</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="reveals">
          <h2>Reveals</h2>
          <p>
            Put <code>&lt;!-- step --&gt;</code> inside a slide to hold back everything after it
            until the next keypress. Use as many as you like.
          </p>
          <Example>{stepExample}</Example>
          <p>
            Going forward walks through a slide&apos;s reveals before moving on; going back steps
            into the previous slide with everything already shown.
          </p>
        </section>

        <section id="notes">
          <h2>Speaker notes</h2>
          <p>
            Notes never appear on the slide. Press <kbd>S</kbd> while presenting to read them.
          </p>
          <Example>{notesExample}</Example>
        </section>

        <section id="layouts">
          <h2>Layouts</h2>
          <p>A layout hint anywhere in a slide changes how that one slide is arranged.</p>
          <Example>{layoutExample}</Example>
          <ul>
            <li>
              <code>default</code> — content starts at the top left
            </li>
            <li>
              <code>center</code> — everything centred, for title and section slides
            </li>
            <li>
              <code>full</code> — no padding, so a lone image fills the slide edge to edge
            </li>
          </ul>
        </section>

        <section id="images">
          <h2>Images</h2>
          <p>
            Drag an image onto the editor or paste one from the clipboard. It is stored in this
            browser and a reference is written at your cursor:
          </p>
          <Example>{imageExample}</Example>
          <p>
            Ordinary image URLs work too. Large images are shrunk on the way in, so decks stay small.
            When you download the zip, every image you used is packaged with the deck and the
            references are rewritten to point at the <code>assets/</code> folder.
          </p>
        </section>

        <section id="code-and-math">
          <h2>Code and math</h2>
          <p>Fenced code blocks are highlighted by language:</p>
          <Example>{codeExample}</Example>
          <p>
            Math is written in LaTeX: inline between single dollar signs, as a block between double
            ones.
          </p>
          <Example>{mathExample}</Example>
        </section>

        <section id="presenting">
          <h2>Presenting</h2>
          <p>
            <strong>Present</strong> goes fullscreen. The same keys drive the preview whenever your
            cursor is not in the editor.
          </p>
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>→</kbd> <kbd>↓</kbd> <kbd>Space</kbd> <kbd>Enter</kbd>
                </td>
                <td>Next reveal, then next slide</td>
              </tr>
              <tr>
                <td>
                  <kbd>←</kbd> <kbd>↑</kbd> <kbd>Backspace</kbd>
                </td>
                <td>Back</td>
              </tr>
              <tr>
                <td>
                  <kbd>Home</kbd> <kbd>End</kbd>
                </td>
                <td>First and last slide</td>
              </tr>
              <tr>
                <td>
                  <kbd>S</kbd>
                </td>
                <td>Speaker notes</td>
              </tr>
              <tr>
                <td>
                  <kbd>Esc</kbd>
                </td>
                <td>Leave presenter mode</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="exporting">
          <h2>Taking the deck with you</h2>
          <ul>
            <li>
              <strong>Save .md</strong> — the markdown itself. <strong>Open .md</strong> brings it
              back.
            </li>
            <li>
              <strong>PDF</strong> — opens your browser&apos;s print dialog; choose “Save as PDF”.
              One landscape page per slide, with every reveal shown.
            </li>
            <li>
              <strong>Download zip</strong> — the markdown, your images, and a self-contained{" "}
              <code>index.html</code> that presents the deck offline from a double-click. Handy when
              you will be presenting from a machine that is not yours.
            </li>
          </ul>
        </section>

        <section id="tips">
          <h2>Tips</h2>
          <ul>
            <li>One idea per slide. If a slide needs a scrollbar, it wants to be two slides.</li>
            <li>
              Open with a <code>center</code> layout title slide; it sets the tone for the deck.
            </li>
            <li>
              Reveals are for an argument that builds. A list the audience can take in at a glance
              is better shown at once.
            </li>
            <li>
              Every deck has its own address, taken from its name — a deck titled “Monday standup”
              lives at <code>/monday-standup.md</code>. Bookmark it to come straight back.
            </li>
            <li>
              Your decks are saved in this browser as you type, and listed on the home page. Save the{" "}
              <code>.md</code> file as well if it matters — clearing site data clears them, and a
              private window is a separate store.
            </li>
          </ul>
        </section>
        </main>
      </div>

      <ScrollToTop />
    </div>
  );
}
