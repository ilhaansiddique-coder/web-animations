"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Line colour, any canvas-compatible value. */
  color?: string;
  /** Seconds per full rotation. */
  period?: number;
  /** Overall opacity multiplier — keep it low when used as a backdrop. */
  intensity?: number;
};

const LAT_LINES = 9;
const LON_LINES = 16;
const SEGMENTS = 90;
const TILT = -0.42;

/**
 * Transparent wireframe globe drawn on a 2D canvas: latitude and longitude
 * rings projected orthographically, with per-segment alpha from depth so the
 * far side of the sphere reads as glass instead of a flat grid.
 */
export default function WireGlobe({
  color = "76, 201, 240",
  period = 26,
  intensity = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let radius = 0;
    let frame = 0;
    let start = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) * 0.42;
    };

    // Rotate about Y, then tilt about X, then drop the depth axis.
    const project = (lat: number, lon: number, yaw: number) => {
      const x = Math.cos(lat) * Math.cos(lon + yaw);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon + yaw);
      const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
      const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
      return {
        sx: width / 2 + x * radius,
        sy: height / 2 - y2 * radius,
        depth: z2,
      };
    };

    const stroke = (
      points: { sx: number; sy: number; depth: number }[],
      weight: number,
    ) => {
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        // Front of the sphere is opaque-ish, back fades toward nothing.
        const depth = (a.depth + b.depth) / 2;
        const alpha = (0.06 + 0.34 * (depth * 0.5 + 0.5)) * intensity;
        ctx.strokeStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = weight;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }
    };

    const draw = (now: number) => {
      if (!start) start = now;
      const t = reduced ? 0 : (now - start) / 1000;
      const yaw = (t / period) * Math.PI * 2;

      ctx.clearRect(0, 0, width, height);

      // Latitude rings
      for (let i = 1; i < LAT_LINES; i++) {
        const lat = -Math.PI / 2 + (i / LAT_LINES) * Math.PI;
        const points = [];
        for (let s = 0; s <= SEGMENTS; s++) {
          points.push(project(lat, (s / SEGMENTS) * Math.PI * 2, yaw));
        }
        stroke(points, 1);
      }

      // Longitude rings
      for (let i = 0; i < LON_LINES; i++) {
        const lon = (i / LON_LINES) * Math.PI * 2;
        const points = [];
        for (let s = 0; s <= SEGMENTS; s++) {
          points.push(project(-Math.PI / 2 + (s / SEGMENTS) * Math.PI, lon, yaw));
        }
        stroke(points, 1);
      }

      // Rim + inner wash keep it reading as a sphere, not a net
      ctx.strokeStyle = `rgba(${color}, ${(0.5 * intensity).toFixed(3)})`;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();

      const wash = ctx.createRadialGradient(
        width / 2 - radius * 0.3,
        height / 2 - radius * 0.35,
        radius * 0.1,
        width / 2,
        height / 2,
        radius,
      );
      wash.addColorStop(0, `rgba(${color}, ${(0.1 * intensity).toFixed(3)})`);
      wash.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.fill();

      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [color, period, intensity]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
