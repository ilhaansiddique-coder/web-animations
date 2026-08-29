"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import CopyBar from "@/components/CopyBar";
import type { AnimationEntry } from "@/lib/registry";

/**
 * Mounts children only once the card scrolls near the viewport. WebGL canvases
 * are expensive; a gallery that boots every scene at once stutters on load.
 */
function LazyMount({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {visible ? (
        children
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      )}
    </div>
  );
}

export default function AnimationCard({
  entry,
  height = "h-[420px]",
  children,
}: {
  entry: AnimationEntry;
  height?: string;
  children: ReactNode;
}) {
  return (
    <section className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div
        className={`relative ${height} bg-[radial-gradient(ellipse_at_center,rgba(76,201,240,0.09),transparent_65%)]`}
      >
        <LazyMount>{children}</LazyMount>
      </div>

      <div className="flex flex-1 flex-col border-t border-line px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{entry.title}</h3>
          <div className="flex flex-wrap justify-end gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
          {entry.description}
        </p>
        <div className="mt-3.5">
          <CopyBar entry={entry} />
        </div>
      </div>
    </section>
  );
}
