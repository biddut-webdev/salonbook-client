import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {

  /* config options here */
  // React Compiler spawns Babel workers for every file. On this 4 GB machine
  // those subprocesses run out of memory while compiling, so it stays off.
  reactCompiler: false,
  images: {
    // Remote images: seed/demo photos (Unsplash) and admin uploads (ImgBB).
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  turbopack: {
    // There is a stray package-lock.json in C:\projects, so Next guessed the
    // wrong root and watched every sibling project. Pin it to this folder.
    root: projectRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
