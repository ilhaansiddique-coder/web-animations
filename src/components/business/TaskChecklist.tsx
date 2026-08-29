"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const ROWS = [0, 1, 2, 3];
const ROW_H = 28;
const TOP = 22;

export default function TaskChecklist() {
  const { kf, tween } = useLoop(4.4);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      <rect x="24" y="8" width="152" height="124" rx="10" fill={PALETTE.panel} stroke={PALETTE.line} strokeWidth="2" />

      {ROWS.map((i) => {
        const y = TOP + i * ROW_H + 8;
        // Each row ticks a beat after the one above it, then all reset together.
        const start = 0.12 + i * 0.16;
        const times = [0, start, start + 0.1, 0.92, 1];
        return (
          <g key={i}>
            <rect x={38} y={y - 8} width="16" height="16" rx="4" fill="none" stroke={PALETTE.line} strokeWidth="2" />
            <motion.rect
              x={38}
              y={y - 8}
              width="16"
              height="16"
              rx="4"
              fill={PALETTE.emerald}
              animate={{ opacity: kf([0, 0, 1, 1, 0], 1), scale: kf([0.6, 0.6, 1, 1, 0.6], 1) }}
              transition={tween(times)}
              style={{ transformOrigin: `${46}px ${y}px` }}
            />
            <motion.path
              d={`M41.5 ${y} L45 ${y + 3.5} L51 ${y - 4}`}
              fill="none"
              stroke={PALETTE.ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ pathLength: kf([0, 0, 1, 1, 0], 1) }}
              transition={tween(times)}
            />

            <rect x={64} y={y - 4} width="88" height="8" rx="4" fill={PALETTE.line} />
            <motion.rect
              x={64}
              y={y - 4}
              width={88 - i * 14}
              height="8"
              rx="4"
              fill={PALETTE.accent}
              animate={{ opacity: kf([0.15, 0.15, 0.75, 0.75, 0.15], 0.75) }}
              transition={tween(times)}
            />
          </g>
        );
      })}

      {/* Progress bar across the bottom of the card */}
      <rect x={38} y={120} width="124" height="4" rx="2" fill={PALETTE.line} />
      <motion.rect
        y={120}
        x={38}
        height="4"
        rx="2"
        fill={PALETTE.magenta}
        animate={{ width: kf([0, 124, 124, 0], 124) }}
        transition={tween([0, 0.7, 0.92, 1])}
      />
    </svg>
  );
}
