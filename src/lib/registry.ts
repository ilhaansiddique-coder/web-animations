/**
 * Single source of truth for the gallery: what each animation is, which file
 * backs it, and the three things a visitor can copy — setup, AI prompt, code.
 */
export type AnimationEntry = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  /** Key into public/snippets.json. */
  file: string;
  component: string;
  /** Extra files the component needs, concatenated into the code copy. */
  extraFiles?: string[];
  deps: string[];
  usage: string;
  /** Anything the copied code can't carry on its own. */
  notes?: string[];
  prompt: string;
};

const R3F = ["three", "@react-three/fiber", "@react-three/drei"];
const MOTION = ["motion"];

export const FEATURED: AnimationEntry[] = [
  {
    id: "wire-globe",
    title: "Transparent wire globe",
    description:
      "A glass wireframe sphere on a 2D canvas — latitude and longitude rings with per-segment depth fade, so the far side reads as glass. Sized to its container; drop it behind a hero at low intensity.",
    tags: ["canvas", "backdrop"],
    file: "components/WireGlobe.tsx",
    component: "WireGlobe",
    deps: [],
    usage: `<div className="absolute inset-0 -z-10 opacity-40">
  <WireGlobe color="76, 201, 240" period={26} intensity={1} />
</div>`,
    notes: ["No dependencies — plain canvas 2D and a ResizeObserver."],
    prompt:
      "Build a React client component that renders a transparent wireframe globe on a 2D canvas. Project a unit sphere orthographically: 9 latitude rings and 16 longitude rings, 90 segments each, rotated about Y over a configurable period and tilted about X by roughly -0.42rad. Draw each segment separately and set its alpha from the midpoint depth so the far hemisphere fades toward transparent. Add a crisp rim circle and a soft off-centre radial wash inside the sphere. Handle devicePixelRatio, resize via ResizeObserver, and freeze rotation when prefers-reduced-motion is set. Props: color (an 'r, g, b' string), period in seconds, intensity multiplier.",
  },
  {
    id: "hero-dashboard",
    title: "Hero dashboard",
    description:
      "A tilted order board that floats while its rows run on a CSS conveyor, KPI chips drifting above it, and a courier rail with a package riding a dashed flow path into a delivery pulse. Pure CSS keyframes — no timers, no state.",
    tags: ["CSS 3D", "keyframes", "UI"],
    file: "components/HeroDashboard.tsx",
    extraFiles: ["components/HeroDashboard.module.css"],
    component: "HeroDashboard",
    deps: [],
    usage: `<HeroDashboard />          {/* or theme="light" for the green palette */}`,
    notes: [
      "Two files: the component and its CSS module — both are in the copied code.",
      "Six rows share one 24s conveyor offset by -3s each, so five slots are always filled.",
      "Give it a container at least ~640px wide; below 900px the rail and sidebar drop out.",
    ],
    prompt:
      "Build a hero dashboard cluster in React where every loop is a CSS keyframe — no timers, no state. Centre it on a tilted app panel: rotateX(6deg) rotateY(-13deg) rotate(1.2deg) inside a parent with perspective 1400px, floating on an 8s loop where the tilt itself breathes (6deg to 5deg, -13deg to -11deg) while it lifts 7px. Inside the panel put a sidebar of nav items, a header with a pulsing LIVE pill, a toolbar, filter chips and an order table. The rows are the centrepiece: six absolutely positioned rows share one 24s conveyor keyframe with -3s stagger — a row fades in above the list, holds the top slot, then steps down one row height every 3s (dropping z-index as it goes) before fading off the bottom, so five slots are always filled. Float three KPI chips above the panel on a 6s translateY loop delayed 0s/0.5s/1s. On the right, run a vertical rail: an SVG flow path with a dashed overlay animating stroke-dashoffset, a package glyph riding it via animateMotion with rotate=auto over 4.8s, courier cards beside it, and a delivery badge whose ring and label only fire in the last 20% of the package's trip. Support a light and a dark palette through CSS custom properties, and park everything in a static state under prefers-reduced-motion.",
  },
  {
    id: "world-flight-map",
    title: "World flight map",
    description:
      "Every country as its own path — real borders, continents colour-coded on hover — with a flight network radiating out of Dhaka: 18 spokes to airports on every continent, aircraft riding bowed arcs with glowing trails, and Bangladesh tinted as the home base.",
    tags: ["SVG", "map", "animateMotion"],
    file: "components/WorldFlightMap.tsx",
    extraFiles: ["lib/world-map.ts"],
    component: "WorldFlightMap",
    deps: [],
    usage: `<div className="h-[420px] w-full">
  <WorldFlightMap />
</div>`,
    notes: [
      "src/lib/world-map.ts is generated — run `node scripts/generate-world-map.mjs` (dev deps: world-atlas, topojson-client, i18n-iso-countries, countries-list).",
      "Add the .wfm-* classes and @keyframes wfm-trail / wfm-plane / wfm-ping from globals.css.",
      "Change ORIGIN, ORIGIN_COUNTRY and the ROUTES list at the top of the file to fly the network out of a different hub.",
    ],
    prompt:
      "Build a React world map with animated flights as one SVG. Pregenerate the geography at author time: take Natural Earth 110m country polygons, project them with a Miller cylindrical projection into a 1000-unit-wide viewBox, clamp latitude to drop Antarctica, run Douglas-Peucker simplification, and emit each country as an SVG path string with its name and continent code — so the component projects nothing at runtime. Render one path per country with its own stroke as the border; hovering a country tints every country on the same continent and shows a tooltip with the country and continent name, with a legend that dims to the hovered continent. For flights, model a hub-and-spoke: one ORIGIN airport (lon/lat) and a list of destinations, each with its own duration and start delay. Build a quadratic bezier from the origin to each destination with the control point pushed perpendicular to the route by about a quarter of its length, so long hops bow harder. Tint the origin's country permanently, mark it with a labelled pin and two offset ping rings, and label each destination with its IATA code. Per route draw a faint guide path, a travelling trail (set pathLength=1 and animate stroke-dashoffset from 0.08 to -1 so speed is independent of arc length), and an aircraft triangle moving with SVG animateMotion, rotate=auto, referencing the guide path by id. Pulse a ring at each hub. Give each route its own duration and delay through CSS custom properties, and under prefers-reduced-motion drop the animateMotion elements and freeze the trails.",
  },
  {
    id: "route-globe",
    title: "Global network globe",
    description:
      "A dotted Earth built from 7,400 Natural Earth coastline samples baked at author time — no texture or map tiles at runtime. City markers pulse and shader-driven comet arcs run the routes between them. Drag to spin.",
    tags: ["three.js", "GLSL", "r3f"],
    file: "components/three/Globe.tsx",
    extraFiles: ["lib/geo.ts"],
    component: "Globe",
    deps: R3F,
    usage: `<div className="h-[520px] w-full">
  <Globe />
</div>`,
    notes: [
      "Also needs src/lib/land-dots.ts — generate it with `node scripts/generate-land-dots.mjs` (dev deps: world-atlas, topojson-client).",
      "Load it with next/dynamic and ssr:false; a WebGL canvas cannot be server rendered.",
    ],
    prompt:
      "Build a react-three-fiber globe component. Geometry: an opaque dark core sphere, a faint wireframe graticule, and a THREE.Points cloud of land dots built from a pregenerated lat/lon table (Natural Earth 110m coastlines, quantised to hundredths of a degree). Write a custom shader for the dots: point size in CSS pixels scaled by devicePixelRatio and camera distance, circular alpha mask, and a per-point twinkle from a random attribute. Add a backside fresnel atmosphere shader and route arcs built as thin TubeGeometry along quadratic bezier curves bowed outward by distance, with a fragment shader that runs a comet head plus exponential tail along the tube UV and fades both ends. Pulsing ring markers sit at each city. Slow auto-rotation plus OrbitControls with zoom and pan disabled.",
  },
  {
    id: "growth-chart",
    title: "Revenue growth chart",
    description:
      "SVG bars, a drawn trend line and a counting KPI, all looping on one shared 6-second beat so nothing drifts out of sync.",
    tags: ["SVG", "Motion"],
    file: "components/GrowthChart.tsx",
    component: "GrowthChart",
    deps: MOTION,
    usage: `<div className="h-[248px] w-full">
  <GrowthChart />
</div>`,
    notes: ["Edit the BARS and MONTHS arrays to fit your own numbers."],
    prompt:
      "Build a looping SVG revenue chart in React with Framer Motion. Seven bars grow from a baseline with a small per-bar delay, a magenta trend line draws across their tops via pathLength, and dots pop in at each vertex. Everything shares one CYCLE constant and keyframe times so the grow, hold and clear phases stay locked together; the whole loop repeats forever. Above the chart show a KPI that counts up to its target on the same cycle using requestAnimationFrame, plus a green delta pill. Under prefers-reduced-motion, render the finished state with no animation.",
  },
  {
    id: "node-constellation",
    title: "Node constellation",
    description:
      "Canvas 2D particle mesh that links nearby nodes and bends toward your cursor. No WebGL, honours reduced-motion.",
    tags: ["canvas", "pointer"],
    file: "components/NetworkConstellation.tsx",
    component: "NetworkConstellation",
    deps: [],
    usage: `<div className="h-[248px] w-full">
  <NetworkConstellation />
</div>`,
    notes: ["Node count scales with the canvas area, clamped to 30–110."],
    prompt:
      "Build a React client component that draws an interactive particle constellation on a 2D canvas. Seed nodes proportional to canvas area (clamped 30–110), each with a small random velocity and radius. Every frame: drift and bounce them off the edges, pull nodes within 170px of the pointer toward it with a falloff, draw a line between any pair closer than 130px with alpha from their distance, then draw the nodes — highlighting the ones near the pointer in a second colour. Handle devicePixelRatio, resize with a ResizeObserver, attach pointermove/pointerleave on the canvas, and stop the drift under prefers-reduced-motion.",
  },
  {
    id: "logo-marquee",
    title: "Feature marquee",
    description:
      "Edge-faded infinite ticker. The track holds two copies of the list and slides exactly half its width, so the seam never shows. Pauses on hover.",
    tags: ["CSS", "loop"],
    file: "components/LogoMarquee.tsx",
    component: "LogoMarquee",
    deps: [],
    usage: `<div className="h-[64px] w-full">
  <LogoMarquee />
</div>`,
    notes: [
      "Add the keyframes to your global CSS:\n@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }",
    ],
    prompt:
      "Build a React marquee component: a horizontally scrolling row of pill-shaped chips, each with a small inline SVG icon and a label. Render the item list twice in one flex track and animate it with a CSS keyframe from translateX(0) to translateX(-50%) on a linear infinite 26s loop, so the loop is seamless. Fade both edges with a mask-image linear-gradient, pause the animation on hover via a group-hover animation-play-state rule, and disable it entirely under motion-reduce.",
  },
];

export const BUSINESS: AnimationEntry[] = [
  {
    id: "rocket-launch",
    title: "Launch",
    description: "Product / startup growth",
    tags: ["SVG", "Motion"],
    file: "components/business/RocketLaunch.tsx",
    component: "RocketLaunch",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><RocketLaunch /></div>`,
    prompt:
      "Build a looping flat SVG rocket-launch scene (200x140 viewBox) in React with Framer Motion: stars streaming downward at staggered delays, a rocket bobbing on a slow loop with a two-layer flickering flame (magenta outer, amber inner) scaling from its base, triangular fins, a glowing porthole, and smoke puffs drifting out to both sides while they grow and fade.",
  },
  {
    id: "target-hit",
    title: "On target",
    description: "Goals and KPIs hit",
    tags: ["SVG", "Motion"],
    file: "components/business/TargetHit.tsx",
    component: "TargetHit",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><TargetHit /></div>`,
    prompt:
      "Build a looping flat SVG bullseye scene (200x140 viewBox) in React with Framer Motion: three concentric rings plus a centre dot, a dart that flies in from the left, sticks, then resets off-frame. On impact the rings recoil outward, the centre dot punches up in scale, and six short burst lines fan out and fade. Drive every element from one shared cycle with keyframe times.",
  },
  {
    id: "coin-stack",
    title: "Revenue",
    description: "Stacking earnings",
    tags: ["SVG", "Motion"],
    file: "components/business/CoinStack.tsx",
    component: "CoinStack",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><CoinStack /></div>`,
    prompt:
      "Build a looping flat SVG revenue scene (200x140 viewBox) in React with Framer Motion: three columns of coins (3, 4 and 5 high) where each coin drops in from above on a staggered delay and stacks on a ground line. Draw coins as two offset ellipses so they read as 3D discs. Over the top, fade in a magenta growth line with an arrowhead that rises as the stacks fill, then clear everything and repeat.",
  },
  {
    id: "conversion-funnel",
    title: "Conversion",
    description: "Leads through the funnel",
    tags: ["SVG", "Motion"],
    file: "components/business/ConversionFunnel.tsx",
    component: "ConversionFunnel",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><ConversionFunnel /></div>`,
    prompt:
      "Build a looping flat SVG conversion funnel (200x140 viewBox) in React with Framer Motion. Paint the funnel body first, then the falling lead dots, then the funnel outline last so the dots read as being inside it. Six leads fall from above and converge toward the neck; three continue out the bottom as converted customers in a second colour, the rest fade out mid-funnel. Pulse the funnel's inner fill on the same cycle.",
  },
  {
    id: "idea-gears",
    title: "Innovation",
    description: "Ideas in motion",
    tags: ["SVG", "Motion"],
    file: "components/business/IdeaGears.tsx",
    component: "IdeaGears",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><IdeaGears /></div>`,
    prompt:
      "Build a looping flat SVG innovation scene (200x140 viewBox) in React with Framer Motion: a lightbulb with a zigzag filament that fades up and down, eight glow rays around it pulsing on the same cycle, a screw base, and three gears turning below at different speeds — one clockwise, two counter. Generate the gear outlines from a helper that emits four points per tooth (rise, flat top, fall, flat root) so the teeth are flat-topped rather than star-shaped.",
  },
  {
    id: "contract-sign",
    title: "Deal closed",
    description: "Contract signed off",
    tags: ["SVG", "Motion"],
    file: "components/business/ContractSign.tsx",
    component: "ContractSign",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><ContractSign /></div>`,
    prompt:
      "Build a looping flat SVG contract-signing scene (200x140 viewBox) in React with Framer Motion: a document card with text lines and a signature rule. A cursive signature path draws in via pathLength while a pen rides the exact same path using CSS offset-path with offsetDistance animated 0 to 100%. Once the signature lands, a rotated SIGNED stamp scales down from 1.8 and holds, then everything clears for the next take.",
  },
  {
    id: "paper-plane",
    title: "Outreach",
    description: "Campaign delivered",
    tags: ["SVG", "Motion"],
    file: "components/business/PaperPlane.tsx",
    component: "PaperPlane",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><PaperPlane /></div>`,
    prompt:
      "Build a looping flat SVG outreach scene (200x140 viewBox) in React with Framer Motion: a dashed guide curve from a start dot to a destination, a solid trail that draws along it via pathLength then fades, and a paper plane that follows the identical curve using CSS offset-path with offsetRotate:auto so it banks through the turns. When it arrives, a ring at the destination scales up and fades as a delivery confirmation.",
  },
  {
    id: "task-checklist",
    title: "Execution",
    description: "Tasks shipping",
    tags: ["SVG", "Motion"],
    file: "components/business/TaskChecklist.tsx",
    component: "TaskChecklist",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><TaskChecklist /></div>`,
    prompt:
      "Build a looping flat SVG checklist scene (200x140 viewBox) in React with Framer Motion: a rounded card with four task rows, each an empty checkbox and a label bar. Rows complete top to bottom, one beat apart — the checkbox fills green with a scale pop, a checkmark draws in via pathLength, and the label bar brightens. A magenta progress bar fills across the bottom over the same cycle, then everything resets together.",
  },
  {
    id: "team-sync",
    title: "Collaboration",
    description: "Team in sync",
    tags: ["SVG", "Motion"],
    file: "components/business/TeamSync.tsx",
    component: "TeamSync",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><TeamSync /></div>`,
    prompt:
      "Build a looping flat SVG collaboration scene (200x140 viewBox) in React with Framer Motion: three teammate avatars (circle head plus a semicircle body, each a different accent colour) arranged in a triangle, joined by dashed links with a packet dot travelling each link on a staggered delay. In the centre put a small shared board whose three bars grow and shrink. Give each avatar an expanding ring pulse and a green presence dot blinking off-cycle.",
  },
  {
    id: "secure-vault",
    title: "Trust",
    description: "Secure by default",
    tags: ["SVG", "Motion"],
    file: "components/business/SecureVault.tsx",
    component: "SecureVault",
    deps: MOTION,
    usage: `<div className="h-32 w-48"><SecureVault /></div>`,
    prompt:
      "Build a looping flat SVG security scene (200x140 viewBox) in React with Framer Motion: a shield outline with a pulsing inner fill, a horizontal scan line sweeping top to bottom and back with its opacity peaking mid-sweep, and a padlock whose shackle lifts then drops shut while the keyhole contracts. Add a large verification ring that expands and fades on its own off-cycle rhythm.",
  },
];

export const ALL = [...FEATURED, ...BUSINESS];

/** The "Copy setup" payload: install, import, mount, plus any gotchas. */
export function setupText(entry: AnimationEntry): string {
  const lines = [`// ${entry.title} — setup`];

  if (entry.deps.length) {
    lines.push("", `npm install ${entry.deps.join(" ")}`);
  } else {
    lines.push("", "// No dependencies.");
  }

  const path = `@/components/${entry.file.replace(/^components\//, "").replace(/\.tsx?$/, "")}`;
  lines.push("", `import ${entry.component} from "${path}";`, "", entry.usage);

  if (entry.notes?.length) {
    lines.push("", ...entry.notes.map((n) => `// ${n.replace(/\n/g, "\n// ")}`));
  }

  return lines.join("\n");
}
