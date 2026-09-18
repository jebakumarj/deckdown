import { describe, expect, it } from "vitest";
import { parseFrontMatter } from "../frontMatter";

describe("parseFrontMatter", () => {
  it("parses metadata and strips the block from the body", () => {
    const { meta, body } = parseFrontMatter(
      ["---", "title: My Talk", "author: Jane", "theme: minimal-dark", "transition: slide", "---", "", "# Hello"].join("\n"),
    );

    expect(meta).toEqual({
      title: "My Talk",
      author: "Jane",
      theme: "minimal-dark",
      transition: "slide",
    });
    expect(body.trim()).toBe("# Hello");
  });

  it("falls back to defaults without front matter", () => {
    const { meta, body, bodyOffset } = parseFrontMatter("# Hello");
    expect(meta.theme).toBe("minimal-light");
    expect(meta.transition).toBe("fade");
    expect(body).toBe("# Hello");
    expect(bodyOffset).toBe(0);
  });

  it("ignores an unknown transition value", () => {
    const { meta } = parseFrontMatter("---\ntransition: explode\n---\n");
    expect(meta.transition).toBe("fade");
  });

  it("does not treat a mid-document rule as front matter", () => {
    const { meta, body } = parseFrontMatter("# Hello\n\n---\n\ntitle: not metadata\n");
    expect(meta.title).toBe("");
    expect(body).toContain("title: not metadata");
  });
});
