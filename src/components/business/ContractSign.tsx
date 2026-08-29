"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const SIGNATURE =
  "M62 96 C70 78 76 78 78 92 C80 106 86 106 92 92 C97 80 104 82 106 94 C108 104 116 100 124 88 C130 80 136 82 138 90";

export default function ContractSign() {
  const { kf, tween } = useLoop(4.2);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Document */}
      <rect x="46" y="12" width="108" height="116" rx="8" fill={PALETTE.panel} stroke={PALETTE.line} strokeWidth="2" />
      {[30, 42, 54, 66].map((y, i) => (
        <rect
          key={y}
          x="60"
          y={y}
          width={i === 3 ? 46 : 80}
          height="5"
          rx="2.5"
          fill={PALETTE.line}
        />
      ))}
      <line x1="60" y1="108" x2="140" y2="108" stroke={PALETTE.line} strokeWidth="2" />

      {/* Signature draws, holds, then clears for the next take */}
      <motion.path
        d={SIGNATURE}
        fill="none"
        stroke={PALETTE.accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ pathLength: kf([0, 1, 1, 0], 1), opacity: kf([1, 1, 1, 0], 1) }}
        transition={tween([0, 0.45, 0.86, 1])}
      />

      {/* Pen tracks the same stroke */}
      <motion.g
        style={{ offsetPath: `path("${SIGNATURE}")`, offsetRotate: "0deg" }}
        animate={{
          offsetDistance: kf(["0%", "100%"], "100%"),
          opacity: kf([0, 1, 1, 0], 0),
        }}
        transition={tween([0, 0.04, 0.45, 0.55])}
      >
        <g transform="rotate(38)">
          <rect x="-3" y="-32" width="6" height="24" rx="2" fill={PALETTE.muted} />
          <path d="M-3 -8 L3 -8 L0 0 Z" fill={PALETTE.magenta} />
        </g>
      </motion.g>

      {/* Approval stamp */}
      <motion.g
        animate={{ scale: kf([1.8, 1.8, 1, 1, 1.8], 1), opacity: kf([0, 0, 1, 1, 0], 1) }}
        transition={tween([0, 0.52, 0.6, 0.88, 0.96])}
        style={{ transformOrigin: "150px 34px" }}
      >
        <g transform="rotate(-14 150 34)">
          <rect x="118" y="20" width="64" height="28" rx="6" fill="none" stroke={PALETTE.emerald} strokeWidth="2.5" />
          <text
            x="150"
            y="39"
            textAnchor="middle"
            fill={PALETTE.emerald}
            fontSize="13"
            fontFamily="monospace"
            letterSpacing="1"
          >
            SIGNED
          </text>
        </g>
      </motion.g>
    </svg>
  );
}
