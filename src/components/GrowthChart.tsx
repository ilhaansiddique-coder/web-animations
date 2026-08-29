"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const BARS = [34, 52, 41, 68, 59, 84, 96];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const W = 520;
const H = 260;
const PAD = 34;
const CYCLE = 6; // seconds — every element loops on this beat

const barWidth = (W - PAD * 2) / BARS.length - 14;
const x = (i: number) => PAD + i * ((W - PAD * 2) / BARS.length) + 7;
const y = (v: number) => H - PAD - (v / 100) * (H - PAD * 2);

const linePath = BARS.map(
  (v, i) => `${i === 0 ? "M" : "L"} ${x(i) + barWidth / 2} ${y(v) - 12}`,
).join(" ");

/** Counts 0 → target on the same loop as the chart. */
function Counter({ target, still }: { target: number; still: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (still) return;

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = ((now - start) / 1000) % CYCLE;
      const progress = Math.min(1, t / 2.4);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, still]);

  return <>{(still ? target : value).toLocaleString()}</>;
}

export default function GrowthChart() {
  // With reduced motion the chart snaps to its finished state and stays there.
  const still = useReducedMotion() ?? false;
  const loop = (keyframes: number[], end: number) => (still ? end : keyframes);
  const cycle = still ? 0 : CYCLE;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4">
      <div className="flex w-full max-w-[520px] items-end justify-between px-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Annual recurring revenue
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            $<Counter target={2480} still={still} />k
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-400">
          ▲ 38.2%
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[520px]">
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#4cc9f0" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Baseline grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <line
            key={v}
            x1={PAD}
            x2={W - PAD}
            y1={y(v)}
            y2={y(v)}
            stroke="#1b2130"
            strokeWidth="1"
          />
        ))}

        {BARS.map((v, i) => (
          <g key={MONTHS[i]}>
            <motion.rect
              x={x(i)}
              width={barWidth}
              rx="4"
              fill="url(#barFill)"
              initial={{ height: 0, y: H - PAD }}
              animate={{
                height: loop([0, H - PAD - y(v), H - PAD - y(v), 0], H - PAD - y(v)),
                y: loop([H - PAD, y(v), y(v), H - PAD], y(v)),
              }}
              transition={{
                duration: cycle,
                times: [0, 0.32, 0.86, 1],
                repeat: still ? 0 : Infinity,
                delay: still ? 0 : i * 0.07,
                ease: "easeOut",
              }}
            />
            <text
              x={x(i) + barWidth / 2}
              y={H - PAD + 16}
              textAnchor="middle"
              className="fill-[#8b93a7] font-mono text-[10px]"
            >
              {MONTHS[i]}
            </text>
          </g>
        ))}

        {/* Trend line drawing over the bars */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#f72585"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: loop([0, 1, 1, 0], 1),
            opacity: loop([0, 1, 1, 0], 1),
          }}
          transition={{
            duration: cycle,
            times: [0, 0.42, 0.88, 1],
            repeat: still ? 0 : Infinity,
          }}
        />

        {BARS.map((v, i) => (
          <motion.circle
            key={`dot-${MONTHS[i]}`}
            cx={x(i) + barWidth / 2}
            cy={y(v) - 12}
            r="4"
            fill="#05060a"
            stroke="#f72585"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: loop([0, 1, 1, 0], 1) }}
            transition={{
              duration: cycle,
              times: [0, 0.45, 0.88, 1],
              repeat: still ? 0 : Infinity,
              delay: still ? 0 : i * 0.05,
            }}
            style={{ transformOrigin: `${x(i) + barWidth / 2}px ${y(v) - 12}px` }}
          />
        ))}
      </svg>
    </div>
  );
}
