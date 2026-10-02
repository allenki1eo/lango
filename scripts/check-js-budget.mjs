/**
 * Fails when a prerendered public page ships more JavaScript than the budget (CLAUDE.md, PRD §7).
 * Measures gzip size of every script a modern browser downloads; noModule polyfills are excluded.
 * Run after `pnpm build`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 150 * 1024;
const APP_DIR = ".next/server/app";
const STATIC_DIR = ".next";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") && !name.startsWith("_") ? [path] : [];
  });
}

const gzipCache = new Map();
function gzipSize(src) {
  if (!gzipCache.has(src)) {
    const file = join(STATIC_DIR, src.replace(/^\/_next/, ""));
    gzipCache.set(src, gzipSync(readFileSync(file), { level: 9 }).length);
  }
  return gzipCache.get(src);
}

const pages = htmlFiles(APP_DIR);
if (pages.length === 0) {
  console.error("No prerendered pages found. Run `pnpm build` first.");
  process.exit(1);
}

let failed = false;
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const scripts = new Set(
    [...html.matchAll(/<script\b([^>]*)>/g)]
      .map(([, attrs]) => attrs)
      .filter((attrs) => !/\bnoModule\b/i.test(attrs))
      .map((attrs) => attrs.match(/\bsrc="([^"]+\.js)"/)?.[1])
      .filter(Boolean),
  );
  const total = [...scripts].reduce((sum, src) => sum + gzipSize(src), 0);
  const over = total > BUDGET_BYTES;
  failed ||= over;
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
  console.log(
    `${over ? "✗" : "✓"} /${relative(APP_DIR, page).replace(/\.html$/, "")}  ${kb(total)} of ${kb(BUDGET_BYTES)}`,
  );
}

if (failed) {
  console.error("\nA public page is over the JavaScript budget.");
  process.exit(1);
}
