"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DISTANCE = 130;
const POINTER_RADIUS = 170;

export default function NetworkConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    const pointer = { x: -9999, y: -9999 };

    const seed = () => {
      const count = Math.round((width * height) / 12000);
      nodes = Array.from({ length: Math.min(110, Math.max(30, count)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 0.9 + Math.random() * 1.6,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
        }
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Nodes lean toward the pointer, so the mesh feels alive under the cursor.
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < POINTER_RADIUS) {
          const pull = (1 - dist / POINTER_RADIUS) * 0.35;
          n.x += (dx / (dist || 1)) * pull;
          n.y += (dy / (dist || 1)) * pull;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DISTANCE) continue;
          const alpha = (1 - d / LINK_DISTANCE) * 0.5;
          ctx.strokeStyle = `rgba(76, 201, 240, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const near = Math.hypot(pointer.x - n.x, pointer.y - n.y) < POINTER_RADIUS;
        ctx.fillStyle = near ? "#f72585" : "#8fe3ff";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (near ? 0.8 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    frame = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
