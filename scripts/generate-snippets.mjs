/**
 * Bundles the source of every gallery component into public/snippets.json so
 * the "Copy code" buttons can hand a visitor the real file, byte for byte.
 *
 *   node scripts/generate-snippets.mjs
 *
 * Served as a static asset rather than imported, so ~60 KB of source strings
 * never lands in the page bundle.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const src = join(root, "src");

const FILES = [
  "components/WireGlobe.tsx",
  "components/HeroDashboard.tsx",
  "components/HeroDashboard.module.css",
  "components/WorldFlightMap.tsx",
  "lib/world-map.ts",
  "components/LogoMarquee.tsx",
  "components/GrowthChart.tsx",
  "components/NetworkConstellation.tsx",
  "components/three/Globe.tsx",
  "lib/geo.ts",
  "components/business/loop.ts",
  ...readdirSync(join(src, "components/business"))
    .filter((f) => f.endsWith(".tsx") && f !== "BusinessGrid.tsx")
    .map((f) => `components/business/${f}`),
];

const snippets = {};
for (const file of FILES) {
  snippets[file] = readFileSync(join(src, file), "utf8");
}

writeFileSync(
  join(root, "public/snippets.json"),
  JSON.stringify(snippets, null, 0),
);

const bytes = Object.values(snippets).reduce((n, s) => n + s.length, 0);
console.log(`wrote ${FILES.length} snippets (${(bytes / 1024).toFixed(1)} KB)`);
