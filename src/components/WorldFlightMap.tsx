"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  COUNTRIES,
  CONTINENTS,
  MAP_HEIGHT,
  MAP_WIDTH,
  projectPoint,
} from "@/lib/world-map";

/**
 * World map with real country borders and a live flight network out of Dhaka.
 *
 * Country outlines are pregenerated SVG paths (Natural Earth 110m, Miller
 * projection) so nothing is projected at runtime. Bangladesh is tinted as the
 * home base and every route is a spoke from DAC; hovering any country lifts its
 * whole continent. Aircraft ride their arcs with SVG animateMotion and the
 * trails run on CSS keyframes, so the loop stays off the main thread.
 */

const CONTINENT_TINT: Record<string, string> = {
  AF: "#f7b267",
  AS: "#f4845f",
  EU: "#4cc9f0",
  NA: "#7bdff2",
  SA: "#c77dff",
  OC: "#80ed99",
};

type Airport = {
  code: string;
  city: string;
  lon: number;
  lat: number;
  /** Nudge the label when two airports sit on top of each other. */
  labelDy?: number;
};

/** Every route flies out of Dhaka — the map is a hub-and-spoke, not a mesh. */
const ORIGIN: Airport = {
  code: "DAC",
  city: "Dhaka",
  lon: 90.4,
  lat: 23.84,
};

/** The country tinted permanently as the home base. */
const ORIGIN_COUNTRY = "BD";

const AIRPORTS: Record<string, Airport> = {
  JFK: { code: "JFK", city: "New York", lon: -73.78, lat: 40.64 },
  LHR: { code: "LHR", city: "London", lon: -0.46, lat: 51.47 },
  DXB: { code: "DXB", city: "Dubai", lon: 55.36, lat: 25.25 },
  SIN: { code: "SIN", city: "Singapore", lon: 103.99, lat: 1.36, labelDy: 12 },
  HND: { code: "HND", city: "Tokyo", lon: 139.78, lat: 35.55 },
  GRU: { code: "GRU", city: "São Paulo", lon: -46.47, lat: -23.43 },
  LOS: { code: "LOS", city: "Lagos", lon: 3.32, lat: 6.58 },
  SYD: { code: "SYD", city: "Sydney", lon: 151.18, lat: -33.94 },
  FRA: { code: "FRA", city: "Frankfurt", lon: 8.57, lat: 50.03 },
  SFO: { code: "SFO", city: "San Francisco", lon: -122.38, lat: 37.62 },
  NBO: { code: "NBO", city: "Nairobi", lon: 36.93, lat: -1.32 },
  JNB: { code: "JNB", city: "Johannesburg", lon: 28.24, lat: -26.13 },
  YYZ: { code: "YYZ", city: "Toronto", lon: -79.63, lat: 43.68 },
  IST: { code: "IST", city: "Istanbul", lon: 28.75, lat: 41.26 },
  JED: { code: "JED", city: "Jeddah", lon: 39.16, lat: 21.68 },
  KUL: { code: "KUL", city: "Kuala Lumpur", lon: 101.71, lat: 2.75 },
  CAN: { code: "CAN", city: "Guangzhou", lon: 113.3, lat: 23.39 },
  ICN: { code: "ICN", city: "Seoul", lon: 126.45, lat: 37.46 },
};

/** [destination, seconds per trip, start delay] — all depart Dhaka */
const ROUTES: [string, number, number][] = [
  ["LHR", 11, 0],
  ["JFK", 13, 1.4],
  ["DXB", 7.5, 2.6],
  ["SIN", 6.5, 0.7],
  ["HND", 8.5, 3.8],
  ["SYD", 10.5, 2.1],
  ["FRA", 10.5, 5.2],
  ["JED", 7, 4.3],
  ["KUL", 6, 1.9],
  ["CAN", 6, 6.1],
  ["ICN", 8, 3.1],
  ["IST", 9, 7.4],
  ["NBO", 8.5, 5.8],
  ["JNB", 10, 0.4],
  ["LOS", 10, 6.7],
  ["SFO", 14, 4.9],
  ["YYZ", 13, 8.2],
  ["GRU", 15, 2.9],
];

function flightPath(a: Airport, b: Airport) {
  const [x1, y1] = projectPoint(a.lon, a.lat);
  const [x2, y2] = projectPoint(b.lon, b.lat);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy) || 1;
  // Bow perpendicular to the route, deeper for longer hops — a route-map arc.
  const lift = Math.min(distance * 0.26, 120);
  const mx = (x1 + x2) / 2 - (dy / distance) * lift;
  const my = (y1 + y2) / 2 + (dx / distance) * lift;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export default function WorldFlightMap() {
  // useId gives every instance its own gradient and path ids
  const uid = useId().replace(/:/g, "");
  const reduced = usePrefersReducedMotion();
  const [hovered, setHovered] = useState<{
    name: string;
    continent: string;
    x: number;
    y: number;
  } | null>(null);

  const flights = useMemo(
    () =>
      ROUTES.map(([to, duration, delay], i) => ({
        key: `${ORIGIN.code}-${to}`,
        pathId: `${uid}-route-${i}`,
        to: AIRPORTS[to],
        d: flightPath(ORIGIN, AIRPORTS[to]),
        duration,
        delay,
      })),
    [uid],
  );

  const destinations = useMemo(
    () =>
      ROUTES.map(([code]) => {
        const airport = AIRPORTS[code];
        const [x, y] = projectPoint(airport.lon, airport.lat);
        return { ...airport, x, y };
      }),
    [],
  );

  const origin = useMemo(() => {
    const [x, y] = projectPoint(ORIGIN.lon, ORIGIN.lat);
    return { x, y };
  }, []);

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label="World map with animated flight routes"
      >
        <defs>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4cc9f0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-home`}>
            <stop offset="0%" stopColor="#f72585" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f72585" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Countries — every border is a path's own stroke */}
        <g>
          {COUNTRIES.map((country) => {
            const active = hovered?.continent === country.continent;
            const home = country.id === ORIGIN_COUNTRY;
            const tint = CONTINENT_TINT[country.continent] ?? "#8b93a7";
            return (
              <path
                key={country.id}
                d={country.d}
                fill={home ? "#f72585" : active ? tint : "#1a2230"}
                fillOpacity={home ? 0.75 : active ? 0.3 : 1}
                stroke={home ? "#ff5fa8" : active ? tint : "#2b3445"}
                strokeWidth={home ? 0.9 : 0.5}
                strokeLinejoin="round"
                className="wfm-country"
                onMouseEnter={(event) => {
                  const box =
                    event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (!box) return;
                  setHovered({
                    name: country.name,
                    continent: country.continent,
                    x: ((event.clientX - box.left) / box.width) * 100,
                    y: ((event.clientY - box.top) / box.height) * 100,
                  });
                }}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </g>

        {/* Routes: a faint guide, a travelling trail, and the aircraft */}
        <g fill="none">
          {flights.map((flight) => (
            <g key={flight.key}>
              <path
                id={flight.pathId}
                d={flight.d}
                stroke="#4cc9f0"
                strokeOpacity="0.16"
                strokeWidth="0.8"
              />
              {/* pathLength=1 normalises the dash, so every route moves at its
                  own tempo regardless of how long the arc actually is */}
              <path
                d={flight.d}
                pathLength={1}
                stroke="#4cc9f0"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="0.08 1"
                className="wfm-trail"
                style={
                  {
                    "--dur": `${flight.duration}s`,
                    "--delay": `${flight.delay}s`,
                  } as React.CSSProperties
                }
              />
              <g
                className="wfm-plane"
                style={
                  {
                    "--dur": `${flight.duration}s`,
                    "--delay": `${flight.delay}s`,
                  } as React.CSSProperties
                }
              >
                <path
                  d="M0 -3.4 L3 3 L0 1.5 L-3 3 Z"
                  fill="#e8eaf2"
                  stroke="#4cc9f0"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                >
                  {!reduced && (
                    <animateMotion
                      dur={`${flight.duration}s`}
                      begin={`${flight.delay}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="spline"
                      keySplines="0.42 0 0.58 1"
                    >
                      <mpath href={`#${flight.pathId}`} />
                    </animateMotion>
                  )}
                </path>
              </g>
            </g>
          ))}
        </g>

        {/* Destination airports */}
        <g>
          {destinations.map((hub, i) => (
            <g key={hub.code}>
              <circle cx={hub.x} cy={hub.y} r="12" fill={`url(#${uid}-glow)`} />
              <circle
                cx={hub.x}
                cy={hub.y}
                r="2.2"
                fill="none"
                stroke="#4cc9f0"
                strokeWidth="0.8"
                className="wfm-ping"
                style={
                  {
                    transformOrigin: `${hub.x}px ${hub.y}px`,
                    "--delay": `${(i % 6) * 0.5}s`,
                  } as React.CSSProperties
                }
              />
              <circle cx={hub.x} cy={hub.y} r="1.7" fill="#ffd166" />
              <text
                x={hub.x}
                y={hub.y + (hub.labelDy ?? -6)}
                textAnchor="middle"
                fill="#c9d2e3"
                fontSize="6.5"
                fontFamily="var(--font-geist-mono), monospace"
                opacity="0.75"
              >
                {hub.code}
              </text>
              <title>
                {hub.city} ({hub.code})
              </title>
            </g>
          ))}
        </g>

        {/* Dhaka — the hub every route departs from */}
        <g>
          <circle cx={origin.x} cy={origin.y} r="22" fill={`url(#${uid}-home)`} />
          <circle
            cx={origin.x}
            cy={origin.y}
            r="3.4"
            fill="none"
            stroke="#f72585"
            strokeWidth="1.1"
            className="wfm-ping"
            style={
              {
                transformOrigin: `${origin.x}px ${origin.y}px`,
                "--delay": "0s",
              } as React.CSSProperties
            }
          />
          <circle
            cx={origin.x}
            cy={origin.y}
            r="3.4"
            fill="none"
            stroke="#f72585"
            strokeWidth="1.1"
            className="wfm-ping"
            style={
              {
                transformOrigin: `${origin.x}px ${origin.y}px`,
                "--delay": "1.6s",
              } as React.CSSProperties
            }
          />
          <circle cx={origin.x} cy={origin.y} r="3" fill="#f72585" stroke="#ffe1ef" strokeWidth="0.8" />
          <text
            x={origin.x}
            y={origin.y + 13}
            textAnchor="middle"
            fill="#ff8ac2"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="var(--font-geist-mono), monospace"
          >
            DHAKA · DAC
          </text>
          <title>Dhaka, Bangladesh (DAC)</title>
        </g>
      </svg>

      {/* Continent legend — dims to the hovered continent */}
      <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(CONTINENTS).map(([code, name]) => (
          <span
            key={code}
            className={`flex items-center gap-1.5 font-mono text-[9px] transition-opacity ${
              hovered && hovered.continent !== code ? "opacity-25" : "opacity-80"
            }`}
            style={{ color: CONTINENT_TINT[code] ?? "#8b93a7" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: CONTINENT_TINT[code] ?? "#8b93a7" }}
            />
            {name}
          </span>
        ))}
      </div>

      {hovered && (
        <span
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[160%] whitespace-nowrap rounded-md border border-line bg-panel px-2 py-1 text-[11px]"
          style={{ left: `${hovered.x}%`, top: `${hovered.y}%` }}
        >
          {hovered.name}
          <span className="ml-1.5 text-muted">
            {CONTINENTS[hovered.continent] ?? hovered.continent}
          </span>
        </span>
      )}
    </div>
  );
}
