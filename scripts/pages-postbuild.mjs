#!/usr/bin/env node
/**
 * Finish a GitHub Pages build: Jekyll must not eat `_` files, and unknown
 * paths (Guide, FAQ, Keys, Tests) need a 404.html that is the SPA shell so
 * the router can recover the deep link.
 */
import { copyFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CANDIDATES = [".output/public", "dist/client", "dist", ".vercel/output/static"];

function findPublicDir() {
  for (const dir of CANDIDATES) {
    if (existsSync(join(dir, "index.html")) || existsSync(join(dir, "_shell.html"))) {
      return dir;
    }
  }
  throw new Error(
    `GitHub Pages build produced no index.html. Looked in: ${CANDIDATES.join(", ")}`,
  );
}

function firstExisting(dir, names) {
  for (const name of names) {
    const path = join(dir, name);
    if (existsSync(path)) return path;
  }
  return null;
}

const publicDir = findPublicDir();
const shell = firstExisting(publicDir, ["index.html", "_shell.html"]);
if (!shell) {
  throw new Error(`No SPA shell in ${publicDir}`);
}

if (!existsSync(join(publicDir, "index.html"))) {
  copyFileSync(shell, join(publicDir, "index.html"));
}
copyFileSync(join(publicDir, "index.html"), join(publicDir, "404.html"));
writeFileSync(join(publicDir, ".nojekyll"), "");

const listing = readdirSync(publicDir).sort();
console.log(`[pages] public dir: ${publicDir}`);
console.log(`[pages] files: ${listing.join(", ")}`);
