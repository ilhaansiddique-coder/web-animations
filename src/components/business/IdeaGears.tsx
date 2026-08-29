"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

/**
 * Gear outline with flat-topped teeth — four points per tooth (rise, flat top,
 * fall, flat root) rather than alternating radii, which just makes a star.
 */
function gearPath(teeth: number, outer: number, inner: number) {
  const step = (Math.PI * 2) / teeth;
  const at = (r: number, a: number) =>
    `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;

  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    points.push(at(outer, a + step * 0.1));
    points.push(at(outer, a + step * 0.4));
    points.push(at(inner, a + step * 0.56));
    points.push(at(inner, a + step * 0.94));
  }
  return `M ${points.join(" L ")} Z`;
}

const BIG = gearPath(10, 24, 17);
const SMALL = gearPath(8, 16, 11);

export default function IdeaGears() {
  const { kf, tween, pulse } = useLoop(3);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Glow rays behind the bulb */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <motion.line
          key={angle}
          x1={100 + Math.cos((angle * Math.PI) / 180) * 30}
          y1={54 + Math.sin((angle * Math.PI) / 180) * 30}
          x2={100 + Math.cos((angle * Math.PI) / 180) * 40}
          y2={54 + Math.sin((angle * Math.PI) / 180) * 40}
          stroke={PALETTE.amber}
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ opacity: kf([0, 0.8, 0], 0.6), scale: kf([0.9, 1.05, 0.9], 1) }}
          transition={tween(undefined, 0.05)}
          style={{ transformOrigin: "100px 54px" }}
        />
      ))}

      {/* Bulb */}
      <motion.g
        animate={{ opacity: kf([0.45, 1, 0.45], 1) }}
        transition={tween()}
      >
        <path
          d="M100 24 C114 24 124 35 124 48 C124 58 117 63 114 70 L86 70 C83 63 76 58 76 48 C76 35 86 24 100 24 Z"
          fill={PALETTE.amber}
          fillOpacity="0.16"
          stroke={PALETTE.amber}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M92 48 L96 56 L100 44 L104 56 L108 48"
          fill="none"
          stroke={PALETTE.amber}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Screw base */}
      <rect x="88" y="72" width="24" height="6" rx="2" fill={PALETTE.line} />
      <rect x="88" y="81" width="24" height="6" rx="2" fill={PALETTE.line} />
      <rect x="93" y="90" width="14" height="6" rx="2" fill={PALETTE.line} />

      {/* Meshed gears: opposite directions, one full turn each cycle */}
      <motion.g
        animate={{ rotate: kf([0, 360], 0) }}
        transition={{ ...pulse(6), ease: "linear" }}
        style={{ transformOrigin: "44px 102px" }}
      >
        <path d={BIG} transform="translate(44 102)" fill={PALETTE.panel} stroke={PALETTE.accent} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="44" cy="102" r="6" fill={PALETTE.ink} stroke={PALETTE.accent} strokeWidth="2.5" />
      </motion.g>
      <motion.g
        animate={{ rotate: kf([0, -360], 0) }}
        transition={{ ...pulse(4.6), ease: "linear" }}
        style={{ transformOrigin: "92px 124px" }}
      >
        <path d={SMALL} transform="translate(92 124)" fill={PALETTE.panel} stroke={PALETTE.magenta} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="92" cy="124" r="4.5" fill={PALETTE.ink} stroke={PALETTE.magenta} strokeWidth="2.5" />
      </motion.g>
      <motion.g
        animate={{ rotate: kf([0, -360], 0) }}
        transition={{ ...pulse(5.2), ease: "linear" }}
        style={{ transformOrigin: "154px 100px" }}
      >
        <path d={SMALL} transform="translate(154 100)" fill={PALETTE.panel} stroke={PALETTE.accent} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="154" cy="100" r="4.5" fill={PALETTE.ink} stroke={PALETTE.accent} strokeWidth="2.5" />
      </motion.g>
    </svg>
  );
}
