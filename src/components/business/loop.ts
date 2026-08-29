"use client";

import { useReducedMotion } from "motion/react";

/**
 * Shared timing helpers for the looping business scenes. Every scene animates
 * keyframe arrays on one repeating cycle; with reduced motion the same helpers
 * collapse the loop to its resting frame instead of stopping mid-gesture.
 */
export function useLoop(cycle: number) {
  const still = useReducedMotion() ?? false;

  return {
    still,
    /** Keyframes while animating, a single resting value when reduced. */
    kf<T>(frames: T[], rest: T): T[] | T {
      return still ? rest : frames;
    },
    /** Transition spread onto every looping element. */
    tween(times?: number[], delay = 0) {
      return {
        duration: still ? 0 : cycle,
        times,
        repeat: still ? 0 : Infinity,
        delay: still ? 0 : delay,
        ease: "easeInOut" as const,
      };
    },
    /** Off-cycle transition for details that flicker faster than the loop. */
    pulse(duration: number, delay = 0, ease: "easeInOut" | "easeOut" = "easeInOut") {
      return {
        duration: still ? 0 : duration,
        repeat: still ? 0 : Infinity,
        delay: still ? 0 : delay,
        ease,
      };
    },
  };
}

export const PALETTE = {
  accent: "#4cc9f0",
  accentDim: "#1c6f92",
  magenta: "#f72585",
  amber: "#ffd166",
  emerald: "#34d399",
  ink: "#05060a",
  panel: "#0e1421",
  line: "#243044",
  muted: "#8b93a7",
};
