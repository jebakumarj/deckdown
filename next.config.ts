import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // v1 is a fully client-side app, so it ships as a static export. Remove this
  // when server-side deck sharing and accounts arrive.
  output: "export",
};

export default nextConfig;
