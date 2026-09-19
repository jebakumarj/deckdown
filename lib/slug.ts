/**
 * The hyphenated form of a deck's name, used both for its URL and for the
 * files it exports — so a deck reads the same in an address bar as it does in
 * a downloads folder.
 *
 * Returns an empty string when the name has no usable characters; callers
 * supply their own fallback.
 */
export function slugify(title: string, maxLength = 60): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}
