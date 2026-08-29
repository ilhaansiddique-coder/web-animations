"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

export default function SecureVault() {
  const { kf, tween, pulse } = useLoop(4);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Shield body */}
      <path
        d="M100 12 L150 30 C150 76 132 108 100 128 C68 108 50 76 50 30 Z"
        fill={PALETTE.panel}
        stroke={PALETTE.accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <motion.path
        d="M100 12 L150 30 C150 76 132 108 100 128 C68 108 50 76 50 30 Z"
        fill={PALETTE.accent}
        animate={{ opacity: kf([0.05, 0.18, 0.05], 0.1) }}
        transition={tween()}
      />

      {/* Scan line sweeping the shield */}
      <motion.rect
        x="50"
        width="100"
        height="3"
        fill={PALETTE.accent}
        animate={{ y: kf([16, 122, 16], 70), opacity: kf([0, 0.85, 0], 0.4) }}
        transition={tween()}
      />

      {/* Shackle lifts as the lock opens, then drops shut */}
      <motion.path
        d="M86 68 L86 56 A14 14 0 0 1 114 56 L114 68"
        fill="none"
        stroke={PALETTE.amber}
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ y: kf([0, -8, -8, 0], 0) }}
        transition={tween([0, 0.3, 0.7, 0.9])}
      />
      <rect x="78" y="68" width="44" height="34" rx="7" fill={PALETTE.amber} />
      <motion.circle
        cx="100"
        cy="82"
        r="5"
        fill={PALETTE.ink}
        animate={{ scale: kf([1, 0.7, 1], 1) }}
        transition={tween([0, 0.35, 0.75])}
      />
      <rect x="98" y="84" width="4" height="11" rx="2" fill={PALETTE.ink} />

      {/* Verification ping */}
      <motion.circle
        cx="100"
        cy="70"
        r="56"
        fill="none"
        stroke={PALETTE.emerald}
        strokeWidth="2"
        animate={{ scale: kf([0.55, 1, 0.55], 0.8), opacity: kf([0.6, 0, 0.6], 0.25) }}
        transition={pulse(2.6)}
        style={{ transformOrigin: "100px 70px" }}
      />
    </svg>
  );
}
