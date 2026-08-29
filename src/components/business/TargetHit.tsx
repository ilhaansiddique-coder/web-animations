"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const RINGS = [
  { r: 42, fill: PALETTE.panel, stroke: PALETTE.accent },
  { r: 30, fill: "transparent", stroke: PALETTE.accent },
  { r: 18, fill: "transparent", stroke: PALETTE.accent },
];

export default function TargetHit() {
  const { kf, tween } = useLoop(3);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      <g transform="translate(112 70)">
        {RINGS.map((ring, i) => (
          <motion.circle
            key={ring.r}
            r={ring.r}
            fill={ring.fill}
            stroke={ring.stroke}
            strokeWidth="2.5"
            strokeOpacity={0.35 + i * 0.2}
            // Rings recoil outward on impact, then settle.
            animate={{ scale: kf([1, 1, 1.08, 1], 1) }}
            transition={tween([0, 0.55, 0.65, 0.85], i * 0.03)}
          />
        ))}
        <motion.circle
          r="7"
          fill={PALETTE.magenta}
          animate={{ scale: kf([1, 1, 1.35, 1], 1) }}
          transition={tween([0, 0.55, 0.66, 0.82])}
        />

        {/* Impact burst */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <motion.line
            key={angle}
            x1="0"
            y1="0"
            // Rounded so server and client stringify the same value
            x2={+(Math.cos((angle * Math.PI) / 180) * 20).toFixed(3)}
            y2={+(Math.sin((angle * Math.PI) / 180) * 20).toFixed(3)}
            stroke={PALETTE.amber}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{
              scale: kf([0, 0, 1.6, 2.1], 0),
              opacity: kf([0, 0, 0.9, 0], 0),
            }}
            transition={tween([0, 0.55, 0.68, 0.85])}
          />
        ))}
      </g>

      {/* Dart flies in, sticks, then resets off-frame */}
      <motion.g
        animate={{ x: kf([-96, 0, 0, -96], 0), opacity: kf([0, 1, 1, 0], 1) }}
        transition={tween([0, 0.55, 0.9, 0.99])}
      >
        <line x1="70" y1="70" x2="104" y2="70" stroke={PALETTE.muted} strokeWidth="3" />
        <path d="M104 70 L112 70 L104 65 Z" fill={PALETTE.amber} />
        <path d="M104 70 L112 70 L104 75 Z" fill={PALETTE.amber} />
        <path d="M70 70 L60 63 L64 70 L60 77 Z" fill={PALETTE.magenta} />
      </motion.g>
    </svg>
  );
}
