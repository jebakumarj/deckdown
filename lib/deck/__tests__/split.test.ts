import { describe, expect, it } from "vitest";
import { splitSlides } from "../split";

describe("splitSlides", () => {
  it("splits on `***` preceded by a blank line", () => {
    const slides = splitSlides("# One\n\n***\n\n# Two\n");
    expect(slides).toHaveLength(2);
    expect(slides[0].markdown).toBe("# One");
    expect(slides[1].markdown).toBe("# Two");
  });

  it("does not split on `***` that follows a non-blank line", () => {
    const slides = splitSlides("some text\n***\nmore text\n");
    expect(slides).toHaveLength(1);
  });

  it("does not split on `---`", () => {
    const slides = splitSlides("# One\n\n---\n\n# Two\n");
    expect(slides).toHaveLength(1);
    expect(slides[0].markdown).toContain("---");
  });

  it("ignores a separator inside a fenced code block", () => {
    const slides = splitSlides("# One\n\n```md\n\n***\n\n```\n\ntail\n");
    expect(slides).toHaveLength(1);
  });

  it("records the source offset of each slide", () => {
    const source = "# One\n\n***\n\n# Two\n";
    const slides = splitSlides(source, 10);
    expect(slides[0].startOffset).toBe(10);
    expect(source.slice(slides[1].startOffset - 10)).toContain("# Two");
  });

  it("extracts notes and removes them from the slide", () => {
    const [slide] = splitSlides("# One\n\n<!-- notes: say hello -->\n");
    expect(slide.notes).toBe("say hello");
    expect(slide.markdown).not.toContain("notes:");
  });

  it("reads a layout directive", () => {
    const [slide] = splitSlides("<!-- layout: center -->\n\n# Title\n");
    expect(slide.layout).toBe("center");
    expect(slide.markdown).toBe("# Title");
  });

  it("splits a slide into step groups", () => {
    const [slide] = splitSlides("- a\n<!-- step -->\n- b\n<!-- step -->\n- c\n");
    expect(slide.steps).toEqual(["- a", "- b", "- c"]);
  });

  it("keeps a single group when there are no step markers", () => {
    const [slide] = splitSlides("# One\n");
    expect(slide.steps).toEqual(["# One"]);
  });

  it("returns one empty slide for empty input", () => {
    const slides = splitSlides("");
    expect(slides).toHaveLength(1);
    expect(slides[0].markdown).toBe("");
  });
})
