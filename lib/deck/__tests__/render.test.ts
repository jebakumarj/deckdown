import { describe, expect, it } from "vitest";
import { renderDeck, slideIndexAtOffset } from "../render";

describe("renderDeck", () => {
  it("renders each slide's markdown", () => {
    const deck = renderDeck("# One\n\n***\n\n# Two\n");
    expect(deck.slides).toHaveLength(2);
    expect(deck.slides[0].html).toContain("<h1>One</h1>");
    expect(deck.slides[1].html).toContain("<h1>Two</h1>");
  });

  it("wraps step groups and counts the reveals", () => {
    const [slide] = renderDeck("- a\n<!-- step -->\n- b\n").slides;
    expect(slide.stepCount).toBe(1);
    expect(slide.html).toContain('data-step="0"');
    expect(slide.html).toContain('data-step="1"');
  });

  it("strips scripts and inline event handlers", () => {
    const [slide] = renderDeck('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n').slides;
    expect(slide.html).not.toContain("<script");
    expect(slide.html).not.toContain("onerror");
  });

  it("highlights fenced code", () => {
    const [slide] = renderDeck("```js\nconst x = 1;\n```\n").slides;
    expect(slide.html).toContain("hljs-keyword");
  });

  it("renders math", () => {
    const [slide] = renderDeck("$E=mc^2$\n").slides;
    expect(slide.html).toContain("katex");
  });

  it("resolves asset image urls through the provided resolver", () => {
    const deck = renderDeck("![a](asset:abc)\n", {
      resolveAsset: (id) => `blob:fake/${id}`,
    });
    expect(deck.slides[0].html).toContain("blob:fake/abc");
  });

  it("marks an asset that cannot be resolved", () => {
    const deck = renderDeck("![a](asset:missing)\n");
    expect(deck.slides[0].html).toContain("data-missing-asset");
  });

  it("maps a caret offset back to its slide", () => {
    const source = "---\ntitle: T\n---\n\n# One\n\n***\n\n# Two\n";
    const deck = renderDeck(source);
    expect(slideIndexAtOffset(deck, source.indexOf("# One"))).toBe(0);
    expect(slideIndexAtOffset(deck, source.indexOf("# Two"))).toBe(1);
  });
});
