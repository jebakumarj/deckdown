import MarkdownIt, {
  type MarkdownIt as MarkdownItInstance,
  type RendererRule,
} from "markdown-it";
import katexPlugin from "@vscode/markdown-it-katex";
import hljs from "highlight.js";
import type { RenderOptions } from "./types";

export interface MarkdownEnv {
  [key: string | symbol]: unknown;
  resolveAsset?: RenderOptions["resolveAsset"];
}

const md: MarkdownItInstance = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(code: string, language: string) {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      } catch {
        // fall through to the escaped default below
      }
    }
    return md.utils.escapeHtml(code);
  },
}).use(katexPlugin, { throwOnError: false });

// Uploaded images are written as `asset:<id>`; the host resolves them to a
// blob URL (app) or a relative path (zip export) through the render env.
const defaultImage = md.renderer.rules.image!;
const imageRule: RendererRule = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const src = String(token.attrGet("src") ?? "");
  const assetId = /^asset:(.+)$/.exec(src)?.[1];

  if (assetId) {
    const resolved = (env as MarkdownEnv)?.resolveAsset?.(assetId);
    token.attrSet("src", resolved ?? "");
    if (!resolved) token.attrSet("data-missing-asset", assetId);
  }

  return defaultImage(tokens, idx, options, env, self);
};
md.renderer.rules.image = imageRule;

// External links open in a new tab; nothing should navigate the deck away.
const defaultLinkOpen: RendererRule =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

const linkOpenRule: RendererRule = (tokens, idx, options, env, self) => {
  const href = String(tokens[idx].attrGet("href") ?? "");
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};
md.renderer.rules.link_open = linkOpenRule;

export function renderMarkdown(source: string, env: MarkdownEnv = {}): string {
  return md.render(source, env);
}

export { md };
