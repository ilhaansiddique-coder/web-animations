"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const FLIGHT = "M14 110 C56 110 62 34 106 34 C150 34 152 92 186 74";

export default function PaperPlane() {
  const { kf, tween } = useLoop(4);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Route: a faint guide plus the trail that draws under the plane */}
      <path d={FLIGHT} fill="none" stroke={PALETTE.line} strokeWidth="2" strokeDasharray="5 6" />
      <motion.path
        d={FLIGHT}
        fill="none"
        stroke={PALETTE.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{ pathLength: kf([0, 1, 1], 1), opacity: kf([0.9, 0.9, 0], 0.9) }}
        transition={tween([0, 0.78, 1])}
      />

      <circle cx="14" cy="110" r="4" fill={PALETTE.magenta} />
      <motion.circle
        cx="186"
        cy="74"
        r="6"
        fill="none"
        stroke={PALETTE.emerald}
        strokeWidth="2.5"
        animate={{ scale: kf([0.6, 0.6, 1.4, 1], 1), opacity: kf([0, 0, 1, 0.8], 0.8) }}
        transition={tween([0, 0.7, 0.82, 0.95])}
        style={{ transformOrigin: "186px 74px" }}
      />

      {/* The plane rides the same path via CSS motion path */}
      <motion.g
        style={{ offsetPath: `path("${FLIGHT}")`, offsetRotate: "auto" }}
        animate={{ offsetDistance: kf(["0%", "100%"], "100%"), opacity: kf([0, 1, 1, 0], 1) }}
        transition={tween([0, 0.06, 0.74, 0.82])}
      >
        <path d="M-11 -7 L11 0 L-11 7 L-7 0 Z" fill={PALETTE.accent} />
        <path d="M-11 -7 L-7 0 L-11 7 L-4 0 Z" fill={PALETTE.accentDim} />
      </motion.g>
    </svg>
  );
}
