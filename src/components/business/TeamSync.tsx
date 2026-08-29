"use client";

import { motion } from "motion/react";
import { PALETTE, useLoop } from "./loop";

const SEATS = [
  { x: 46, y: 46, color: PALETTE.accent },
  { x: 154, y: 46, color: PALETTE.magenta },
  { x: 100, y: 112, color: PALETTE.amber },
];

export default function TeamSync() {
  const { kf, tween, pulse } = useLoop(4.5);

  return (
    <svg viewBox="0 0 200 140" className="h-full w-full">
      {/* Links between seats, with a packet travelling each one */}
      {SEATS.map((seat, i) => {
        const next = SEATS[(i + 1) % SEATS.length];
        return (
          <g key={`link-${i}`}>
            <line
              x1={seat.x}
              y1={seat.y}
              x2={next.x}
              y2={next.y}
              stroke={PALETTE.line}
              strokeWidth="2"
              strokeDasharray="4 5"
            />
            <motion.circle
              r="3.5"
              fill={PALETTE.accent}
              animate={{
                cx: kf([seat.x, next.x], seat.x),
                cy: kf([seat.y, next.y], seat.y),
                opacity: kf([0, 1, 1, 0], 0),
              }}
              transition={tween([0, 0.12, 0.8, 1], i * 0.5)}
            />
          </g>
        );
      })}

      {/* Shared board in the middle */}
      <rect x="76" y="58" width="48" height="34" rx="6" fill={PALETTE.panel} stroke={PALETTE.line} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={84 + i * 12}
          width="7"
          rx="2"
          fill={PALETTE.accent}
          animate={{
            height: kf([4, 10 + i * 6, 4], 10 + i * 6),
            y: kf([82, 82 - (6 + i * 6), 82], 82 - (6 + i * 6)),
          }}
          transition={tween(undefined, i * 0.2)}
        />
      ))}

      {/* Teammates: head, shoulders, and a speaking pulse */}
      {SEATS.map((seat, i) => (
        <g key={`seat-${i}`}>
          <motion.circle
            cx={seat.x}
            cy={seat.y}
            r="20"
            fill="none"
            stroke={seat.color}
            strokeWidth="2"
            animate={{ scale: kf([1, 1.25, 1], 1), opacity: kf([0.5, 0, 0.5], 0.3) }}
            transition={tween(undefined, i * 1.3)}
            style={{ transformOrigin: `${seat.x}px ${seat.y}px` }}
          />
          <circle cx={seat.x} cy={seat.y - 6} r="8" fill={seat.color} />
          <path
            d={`M${seat.x - 13} ${seat.y + 14} A13 13 0 0 1 ${seat.x + 13} ${seat.y + 14} Z`}
            fill={seat.color}
            fillOpacity="0.75"
          />
          <motion.circle
            cx={seat.x + 14}
            cy={seat.y - 14}
            r="4"
            fill={PALETTE.emerald}
            animate={{ opacity: kf([0.2, 1, 0.2], 0.6) }}
            transition={pulse(2.2, i * 0.4)}
          />
        </g>
      ))}
    </svg>
  );
}
