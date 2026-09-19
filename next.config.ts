import type { NextConfig } from "next";

/**
 * Set by the GitHub Pages workflow. A project page serves the site from
 * `/<repo>`, so the bundle has to be built for that sub-path; at a domain root
 * it stays empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * GitHub Pages resolves `/docs` against the `docs/` directory the export also
 * writes, so nested routes are emitted as `docs/index.html` there instead.
 * Other hosts keep the flatter `docs.html` layout.
 */
const trailingSlash = process.env.NEXT_PUBLIC_SINGLE_ORIGIN === "1";

const nextConfig: NextConfig = {
  // v1 is a fully client-side app, so it ships as a static export. Remove this
  // when server-side deck sharing and accounts arrive.
  output: "export",
  ...(basePath ? { basePath } : {}),
  ...(trailingSlash ? { trailingSlash } : {}),
};

export default nextConfig;
