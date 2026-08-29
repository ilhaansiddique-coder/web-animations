"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const COLUMNS = [
  { x: 44, coins: 3 },
  { x: 100, coins: 4 },
  { x: 156, coins: 5 },
];

const COIN_H = 13;

export default function CoinStack() {
  const { kf, tween } = useLoop(4);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      <line x1="16" y1="122" x2="184" y2="122" stroke={PALETTE.line} strokeWidth="2" />

      {COLUMNS.map((col, c) =>
        Array.from({ length: col.coins }).map((_, i) => {
          const rest = 116 - i * COIN_H;
          const delay = (c * col.coins + i) * 0.12;
          return (
            <motion.g
              key={`${col.x}-${i}`}
              animate={{
                y: kf([-90, rest - 116, rest - 116, -90], rest - 116),
                opacity: kf([0, 1, 1, 0], 1),
              }}
              transition={tween([0, 0.18, 0.88, 1], delay)}
            >
              {/* Coin: an ellipse body with a lighter top face */}
              <ellipse cx={col.x} cy={116} rx="21" ry="8" fill={PALETTE.accentDim} />
              <ellipse cx={col.x} cy={113} rx="21" ry="8" fill={PALETTE.accent} />
              <ellipse cx={col.x} cy={113} rx="12" ry="4.5" fill={PALETTE.ink} fillOpacity="0.35" />
            </motion.g>
          );
        }),
      )}

      {/* Growth arrow riding over the stacks */}
      <motion.g
        animate={{ opacity: kf([0, 1, 1, 0], 1), y: kf([10, 0, 0, -6], 0) }}
        transition={tween([0, 0.35, 0.9, 1])}
      >
        <path
          d="M32 78 L88 58 L128 66 L172 26"
          fill="none"
          stroke={PALETTE.magenta}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M152 24 L174 22 L172 44 Z" fill={PALETTE.magenta} />
      </motion.g>
    </svg>
  );
}
