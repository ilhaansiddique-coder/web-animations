# Web Animation Kit

Seventeen drop-in animated web elements — a hero dashboard, a world flight map,
two globes, charts, a ticker and ten flat business loops. Next.js 16 (App Router), Tailwind v4,
react-three-fiber and Motion.

```bash
npm install
npm run dev     # http://localhost:3000
```

Every card in the gallery carries three buttons: **Copy setup** (install line,
import, mount snippet, gotchas), **Copy prompt** (an AI prompt that rebuilds the
animation from scratch) and **Copy code** (the component source, byte for byte).

## The components

Each one is self-contained — copy the file, render it inside a sized container,
done. The three.js scenes own their own `<Canvas>`.

| Component | File | Notes |
| --- | --- | --- |
| `HeroDashboard` | [`src/components/HeroDashboard.tsx`](src/components/HeroDashboard.tsx) | Tilted order board on a CSS conveyor, floating KPI chips, courier rail. `theme="light"` for the green palette. |
| `WorldFlightMap` | [`src/components/WorldFlightMap.tsx`](src/components/WorldFlightMap.tsx) | Real country borders, continent highlighting on hover, aircraft flying real city pairs. |
| `WireGlobe` | [`src/components/WireGlobe.tsx`](src/components/WireGlobe.tsx) | Transparent canvas wireframe sphere with depth fade. Doubles as a hero backdrop. |
| `Globe` | [`src/components/three/Globe.tsx`](src/components/three/Globe.tsx) | Dotted Earth, pulsing city markers, comet route arcs. Drag to spin. |
| `GrowthChart` | [`src/components/GrowthChart.tsx`](src/components/GrowthChart.tsx) | SVG bars + drawn trend line + counting KPI. |
| `NetworkConstellation` | [`src/components/NetworkConstellation.tsx`](src/components/NetworkConstellation.tsx) | Canvas 2D particle mesh that reacts to the pointer. |
| `LogoMarquee` | [`src/components/LogoMarquee.tsx`](src/components/LogoMarquee.tsx) | Edge-faded infinite ticker, pauses on hover. |

`AnimationCard` ([`src/components/AnimationCard.tsx`](src/components/AnimationCard.tsx))
is the gallery wrapper. Its `LazyMount` only mounts a scene once it scrolls near
the viewport, so the canvases don't all boot at once.

### Globe

Land is **not** a texture — `src/lib/land-dots.ts` holds 7,444 quantized
lat/lon pairs sampled from Natural Earth 110m coastlines, so there is no map
tile or image fetch at runtime. Dots, atmosphere and arcs are all custom GLSL.

Regenerate the point table (needs the `world-atlas` / `topojson-client` dev
dependencies):

```bash
npm run generate:land        # rewrites src/lib/land-dots.ts
```

Tune density with `SAMPLES` in
[`scripts/generate-land-dots.mjs`](scripts/generate-land-dots.mjs) — 26,000
sphere samples yields ~7,400 land dots.

Routes and city coordinates live in [`src/lib/geo.ts`](src/lib/geo.ts)
(`CITIES`, `ROUTES`). Add a city, add an index pair, and the arc appears.

### World flight map

Country outlines are baked at author time, same trick as the globe's land dots:

```bash
npm run generate:map        # rewrites src/lib/world-map.ts
```

[`scripts/generate-world-map.mjs`](scripts/generate-world-map.mjs) takes Natural
Earth 110m country polygons, projects them with a Miller cylindrical projection
into a 1000-unit viewBox, clamps latitude to trim Antarctica, splits any ring
that jumps the antimeridian (otherwise Russia and Fiji draw as a band across the
map), simplifies with Douglas–Peucker and emits 175 countries with their name
and continent — 83 KB, no projection maths at runtime.

Each country is one `<path>`, so borders are just strokes. Hovering tints the
whole continent and dims the legend to it. Flights are quadratic beziers bowed
perpendicular to the route; the aircraft ride them with SVG `animateMotion` and
the trails use `pathLength="1"` so a short hop and a long haul move at their own
tempo rather than one being dragged by the other.

Edit `AIRPORTS` and `ROUTES` at the top of the component to fly your own network.

### Hero dashboard

The whole cluster runs on CSS keyframes — no timers, no state, nothing to
hydrate:

| Keyframe | What it drives |
| --- | --- |
| `hd-panelfloat` (8s) | Panel lift, with the tilt itself breathing 6°→5° / -13°→-11° |
| `hd-feed` (24s) | The row conveyor — eight rows offset -3s each |
| `hd-float` (6s) | KPI chips and rail cards, delayed 0 / 0.5 / 1s |
| `hd-flowdash` (1.1s) | Dashed flow line on the courier rail |
| `hd-received` / `hd-receivedlabel` (4.8s) | Delivery pulse, timed to the package's arrival |

The conveyor is the trick worth stealing: eight absolutely positioned rows share
one 24s animation with a `-3s` stagger. A row fades in above the list, holds the
top slot (tinted, with an accent edge), then steps down one `--row-h` every 3s —
dropping `z-index` as it goes — before falling off the bottom. Eight rows at 3s
apart exactly cover the 24s cycle, so five slots are always full. Fewer rows and
you get gaps.

Colours come from CSS custom properties on the root element, so
`<HeroDashboard theme="light" />` swaps the entire cluster to a white/green
palette. Under `prefers-reduced-motion` the rows park in their five slots and
every loop stops.

## Business animation set

Ten flat looping scenes in the LottieFiles style —
[`src/components/business/`](src/components/business) — but authored as SVG +
Motion instead of Lottie JSON. No player dependency, no JSON to fetch, and the
colours come from `PALETTE` in [`loop.ts`](src/components/business/loop.ts), so
retheming is one edit.

`Launch` · `TargetHit` · `CoinStack` · `ConversionFunnel` · `IdeaGears` ·
`ContractSign` · `PaperPlane` · `TaskChecklist` · `TeamSync` · `SecureVault`

Each scene is a standalone component with a `200 × 140` viewBox that fills its
container — drop one into any sized box:

```tsx
<div className="h-32 w-48">
  <RocketLaunch />
</div>
```

All ten share `useLoop(cycle)` from
[`loop.ts`](src/components/business/loop.ts): `kf()` returns keyframes normally
and a single resting value under `prefers-reduced-motion`, `tween()`/`pulse()`
build the matching transitions. To add a scene, follow that shape and register
it in [`BusinessGrid.tsx`](src/components/business/BusinessGrid.tsx).

If you do want real LottieFiles JSON alongside these, add `lottie-react` and
render `<Lottie animationData={json} loop />` — nothing here conflicts with it.

## Copy buttons

[`src/lib/registry.ts`](src/lib/registry.ts) is the single source of truth: one
entry per animation with its title, tags, dependencies, mount snippet, setup
notes and AI prompt. The gallery renders from it, so adding an animation means
adding an entry.

Source for **Copy code** comes from `public/snippets.json`, generated from the
real files:

```bash
npm run generate:snippets     # runs automatically on predev / prebuild
```

It is fetched as a static asset (not imported), so ~170 KB of source strings
never lands in the page bundle. [`CopyBar`](src/components/CopyBar.tsx) loads it
once, shares it across every card, and falls back to a hidden textarea when the
async clipboard API is unavailable.

## Notes

- Dark theme tokens are CSS variables in `src/app/globals.css`, exposed to
  Tailwind through `@theme inline`.
- The canvas-2D and SVG pieces honour `prefers-reduced-motion`.
- WebGL scenes are loaded with `next/dynamic` (`ssr: false`) — they cannot be
  server rendered.
