"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const LEADS = [-30, -18, -6, 6, 18, 30];
const FUNNEL = "M40 44 L160 44 L118 88 L118 112 L82 112 L82 88 Z";

export default function ConversionFunnel() {
  const { kf, tween } = useLoop(3.6);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Body first, outline last — leads travel between the two so they read
          as being inside the funnel without hiding its edges. */}
      <path d={FUNNEL} fill={PALETTE.panel} />
      <motion.path
        d={FUNNEL}
        fill={PALETTE.accent}
        animate={{ opacity: kf([0.06, 0.2, 0.06], 0.12) }}
        transition={tween()}
      />

      {LEADS.map((dx, i) => {
        const converts = i === 1 || i === 3 || i === 4;
        return (
          <motion.circle
            key={dx}
            r="5"
            fill={PALETTE.accent}
            animate={{
              cx: kf([100 + dx * 1.5, 100 + dx * 0.9, 100], 100),
              cy: kf([2, 48, converts ? 104 : 72], 104),
              opacity: kf([0, 1, converts ? 1 : 0], converts ? 1 : 0),
            }}
            transition={tween([0, 0.16, 0.6], i * 0.04)}
          />
        );
      })}

      <path
        d={FUNNEL}
        fill="none"
        stroke={PALETTE.accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Converted customers drop out of the neck */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="100"
          r="5"
          fill={PALETTE.magenta}
          animate={{ cy: kf([112, 136], 128), opacity: kf([0, 1, 0], 1) }}
          transition={tween([0.6, 0.78, 0.96], i * 0.12)}
        />
      ))}
    </svg>
  );
}
