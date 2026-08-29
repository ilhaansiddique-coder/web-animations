"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const STARS = [
  [28, 24], [58, 96], [92, 18], [126, 62], [156, 34], [178, 104],
  [44, 62], [148, 82], [108, 108],
];

export default function RocketLaunch() {
  const { kf, tween, pulse } = useLoop(3.2);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Stars stream downward to sell the climb */}
      {STARS.map(([x, y], i) => (
        <motion.circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.6 : 1}
          fill={PALETTE.accent}
          animate={{
            cy: kf([y - 30, y + 30], y),
            opacity: kf([0, 0.7, 0], 0.5),
          }}
          transition={tween(undefined, (i % 5) * 0.4)}
        />
      ))}

      <motion.g
        animate={{ y: kf([6, -6, 6], 0) }}
        transition={tween(undefined, 0)}
      >
        {/* Exhaust */}
        <motion.path
          d="M90 94 L100 128 L110 94 Z"
          fill={PALETTE.magenta}
          animate={{ scaleY: kf([0.6, 1.15, 0.6], 0.9), opacity: kf([0.5, 1, 0.5], 0.85) }}
          transition={pulse(0.32)}
          style={{ transformOrigin: "100px 94px" }}
        />
        <motion.path
          d="M94 94 L100 116 L106 94 Z"
          fill={PALETTE.amber}
          animate={{ scaleY: kf([1.1, 0.7, 1.1], 0.9) }}
          transition={pulse(0.24)}
          style={{ transformOrigin: "100px 94px" }}
        />

        {/* Fins */}
        <path d="M89 70 L70 100 L89 94 Z" fill={PALETTE.magenta} />
        <path d="M111 70 L130 100 L111 94 Z" fill={PALETTE.magenta} />

        {/* Fuselage */}
        <path
          d="M100 18 C112 34 114 60 112 92 L88 92 C86 60 88 34 100 18 Z"
          fill={PALETTE.panel}
          stroke={PALETTE.accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="52" r="8" fill={PALETTE.ink} stroke={PALETTE.accent} strokeWidth="2.5" />
        <motion.circle
          cx="100"
          cy="52"
          r="8"
          fill={PALETTE.accent}
          animate={{ opacity: kf([0.15, 0.45, 0.15], 0.25) }}
          transition={pulse(1.6)}
        />
      </motion.g>

      {/* Smoke puffs left behind */}
      {[-1, 1].map((dir, i) => (
        <motion.circle
          key={dir}
          cy={118}
          fill={PALETTE.accent}
          animate={{
            cx: kf([100, 100 + dir * 34], 100 + dir * 18),
            cy: kf([118, 134], 126),
            r: kf([2, 9], 5),
            opacity: kf([0.3, 0], 0.12),
          }}
          transition={pulse(1.5, i * 0.7, "easeOut")}
        />
      ))}
    </svg>
  );
}
