"use client";

/**
 * The exported deck has to stand on its own, so we harvest the stylesheets the
 * app itself is using (slide layout, themes, transitions, KaTeX) straight from
 * the CSSOM and inline every font/image they reference as a data URI.
 */
export async function collectDeckCss(): Promise<string> {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    collectSheet(sheet, chunks);
  }
  return inlineUrls(chunks.join("\n"));
}

function collectSheet(sheet: CSSStyleSheet, chunks: string[]): void {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    // Cross-origin stylesheet: nothing we can read, and nothing we ship.
    return;
  }

  // `url(...)` resolves against its own stylesheet, not the page, so make the
  // references absolute before the rules leave that context.
  const base = sheet.href ?? document.baseURI;

  for (const rule of Array.from(rules)) {
    // document.styleSheets only lists top-level sheets, so `@import`ed files
    // (the themes, KaTeX) have to be walked explicitly.
    const imported = (rule as CSSImportRule).styleSheet;
    if (imported) collectSheet(imported, chunks);
    else chunks.push(absolutizeUrls(rule.cssText, base));
  }
}

const urlPattern = /url\((['"]?)([^'")]+)\1\)/g;

function absolutizeUrls(css: string, base: string): string {
  return css.replace(urlPattern, (full, quote: string, url: string) => {
    const value = url.trim();
    if (value.startsWith("data:") || value.startsWith("#")) return full;
    try {
      return `url(${quote}${new URL(value, base).href}${quote})`;
    } catch {
      return full;
    }
  });
}

async function inlineUrls(css: string): Promise<string> {
  const targets = new Set<string>();

  for (const match of css.matchAll(urlPattern)) {
    const url = match[2].trim();
    if (url.startsWith("data:")) continue;
    try {
      if (new URL(url, location.href).origin !== location.origin) continue;
    } catch {
      continue;
    }
    targets.add(url);
  }

  const replacements = new Map<string, string>();
  await Promise.all(
    Array.from(targets).map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        replacements.set(url, await blobToDataUrl(await response.blob()));
      } catch {
        // Leave the original reference; the deck still renders without it.
      }
    }),
  );

  return css.replace(urlPattern, (full, quote: string, url: string) => {
    const replacement = replacements.get(url.trim());
    return replacement ? `url(${quote}${replacement}${quote})` : full;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
