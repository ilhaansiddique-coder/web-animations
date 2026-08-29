/**
 * Bakes Natural Earth country outlines into src/lib/world-map.ts as ready-made
 * SVG paths, so the map component ships no topology, no projection library and
 * no runtime maths.
 *
 *   node scripts/generate-world-map.mjs
 *
 * Miller cylindrical projection, latitude clamped to trim Antarctica, then
 * Douglas–Peucker simplification to keep the emitted file small.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import isoCountries from "i18n-iso-countries";
import { countries as countryInfo, continents as continentNames } from "countries-list";

const require = createRequire(import.meta.url);
const topology = JSON.parse(
  readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"),
);
const world = feature(topology, topology.objects.countries);

const WIDTH = 1000;
const LAT_MAX = 83.6;
const LAT_MIN = -56; // Antarctica is dropped, as on most web maps
const TOLERANCE = 0.55; // simplification, in projected units
const MIN_AREA = 1.1; // drop specks smaller than this many square units

/** Miller cylindrical — Mercator's shapes without its polar explosion. */
function project([lon, lat]) {
  const phi = (Math.max(LAT_MIN, Math.min(LAT_MAX, lat)) * Math.PI) / 180;
  const x = ((lon + 180) / 360) * WIDTH;
  const y = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi));
  return [x, y];
}

const yTop = project([0, LAT_MAX])[1];
const yBottom = project([0, LAT_MIN])[1];
const scaleY = (y) => ((yTop - y) / (yTop - yBottom)) * HEIGHT;

// Keep the aspect ratio honest: same units per radian on both axes.
const HEIGHT = Math.round(((yTop - yBottom) * WIDTH) / (2 * Math.PI));

function perpendicularDistance(p, a, b) {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

/** Shoelace area, used to bin out slivers the eye can't resolve anyway. */
function area(points) {
  let sum = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    sum += points[j][0] * points[i][1] - points[i][0] * points[j][1];
  }
  return Math.abs(sum / 2);
}

/**
 * Split a ring wherever it jumps the antimeridian. Without this, Russia and
 * Fiji draw as a band straight across the map.
 */
function splitAtAntimeridian(ring) {
  const segments = [];
  let current = [ring[0]];

  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) {
      segments.push(current);
      current = [];
    }
    current.push(ring[i]);
  }
  segments.push(current);
  return segments;
}

function ringToPath(ring) {
  const parts = [];

  for (const segment of splitAtAntimeridian(ring)) {
    if (segment.length < 3) continue;
    const projected = segment.map((c) => {
      const [x, y] = project(c);
      return [x, scaleY(y)];
    });
    const simplified = simplify(projected, TOLERANCE);
    if (simplified.length < 3 || area(simplified) < MIN_AREA) continue;
    parts.push(
      "M" +
        simplified.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") +
        "Z",
    );
  }

  return parts.length ? parts.join("") : null;
}

// world-atlas carries a few entries the ISO tables don't resolve
const CONTINENT_FALLBACK = {
  Kosovo: "EU",
  "N. Cyprus": "EU",
  Somaliland: "AF",
  Taiwan: "AS",
  "S. Sudan": "AF",
};

const out = [];
for (const f of world.features) {
  const alpha2 = isoCountries.numericToAlpha2(String(f.id)) ?? null;
  const info = alpha2 ? countryInfo[alpha2] : null;
  const name = f.properties?.name ?? info?.name ?? String(f.id);
  const continent = info?.continent ?? CONTINENT_FALLBACK[name] ?? "??";

  // Antarctica is clipped away by LAT_MIN; drop whatever slivers remain.
  if (continent === "AN") continue;

  const polygons =
    f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;

  const paths = [];
  for (const polygon of polygons) {
    // Outer ring only — 110m holes are below the visible threshold here.
    const d = ringToPath(polygon[0]);
    if (d) paths.push(d);
  }
  if (!paths.length) continue;

  const id = alpha2 ?? name.toLowerCase().replace(/[^a-z]+/g, "-");
  out.push({ id, name, continent, d: paths.join("") });
}

out.sort((a, b) => a.name.localeCompare(b.name));

const body = out
  .map(
    (c) =>
      `  { id: ${JSON.stringify(c.id)}, name: ${JSON.stringify(c.name)}, continent: ${JSON.stringify(c.continent)}, d: ${JSON.stringify(c.d)} },`,
  )
  .join("\n");

const continentList = [...new Set(out.map((c) => c.continent))]
  .sort()
  .map((code) => `  ${JSON.stringify(code)}: ${JSON.stringify(continentNames[code] ?? "Other")},`)
  .join("\n");

const file = `// Generated by scripts/generate-world-map.mjs — do not edit by hand.
// ${out.length} countries, Miller cylindrical projection, Douglas–Peucker
// simplified at ${TOLERANCE} units. Antarctica trimmed at ${LAT_MIN}° latitude.

export const MAP_WIDTH = ${WIDTH};
export const MAP_HEIGHT = ${HEIGHT};

export type Country = {
  id: string;
  name: string;
  continent: string;
  d: string;
};

export const CONTINENTS: Record<string, string> = {
${continentList}
};

/** Project a lon/lat pair into the same space as the country paths. */
export function projectPoint(lon: number, lat: number): [number, number] {
  const clamped = Math.max(${LAT_MIN}, Math.min(${LAT_MAX}, lat));
  const phi = (clamped * Math.PI) / 180;
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi));
  const top = ${yTop.toFixed(10)};
  const bottom = ${yBottom.toFixed(10)};
  return [x, ((top - y) / (top - bottom)) * MAP_HEIGHT];
}

export const COUNTRIES: Country[] = [
${body}
];
`;

writeFileSync(new URL("../src/lib/world-map.ts", import.meta.url), file);
console.log(
  `wrote ${out.length} countries · viewBox ${WIDTH}x${HEIGHT} · ${(file.length / 1024).toFixed(1)} KB`,
);
