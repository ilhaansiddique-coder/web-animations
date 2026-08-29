"use client";

import { useEffect, useState } from "react";
import { setupText, type AnimationEntry } from "@/lib/registry";

type Snippets = Record<string, string>;

let snippetsPromise: Promise<Snippets> | null = null;

/**
 * Source is a static asset, fetched once and shared by every CopyBar — it stays
 * out of the page bundle, and by click time it is already in memory so the
 * clipboard write still happens inside the user gesture.
 */
function loadSnippets(): Promise<Snippets> {
  snippetsPromise ??= fetch("/snippets.json")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return snippetsPromise;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and insecure origins have no async clipboard.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

type Kind = "setup" | "prompt" | "code";

const LABELS: Record<Kind, string> = {
  setup: "Copy setup",
  prompt: "Copy prompt",
  code: "Copy code",
};

export default function CopyBar({
  entry,
  compact = false,
}: {
  entry: AnimationEntry;
  compact?: boolean;
}) {
  const [snippets, setSnippets] = useState<Snippets | null>(null);
  const [copied, setCopied] = useState<Kind | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSnippets().then((s) => alive && setSnippets(s));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  const payload = (kind: Kind) => {
    if (kind === "setup") return setupText(entry);
    if (kind === "prompt") return entry.prompt;

    const files = [entry.file, ...(entry.extraFiles ?? [])];
    return files
      .map((f) => `// ---- src/${f} ----\n${snippets?.[f] ?? ""}`)
      .join("\n\n");
  };

  const handle = async (kind: Kind) => {
    const ok = await copyText(payload(kind));
    setFailed(!ok);
    if (ok) setCopied(kind);
  };

  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-1" : "gap-1.5"}`}>
      {(Object.keys(LABELS) as Kind[]).map((kind) => {
        const isCopied = copied === kind;
        const disabled = kind === "code" && !snippets;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => handle(kind)}
            disabled={disabled}
            aria-label={`${LABELS[kind]} for ${entry.title}`}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono transition-colors disabled:opacity-40 ${
              compact ? "text-[10px]" : "text-[11px]"
            } ${
              isCopied
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-line text-muted hover:border-accent/50 hover:text-accent"
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
              {isCopied ? (
                <path
                  d="M3 8.5 L6.5 12 L13 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <g fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
                  <path d="M10.5 3.5 H3.5 A1 1 0 0 0 2.5 4.5 V11" strokeLinecap="round" />
                </g>
              )}
            </svg>
            {isCopied ? "Copied" : compact ? kind : LABELS[kind]}
          </button>
        );
      })}
      {failed && (
        <span className="font-mono text-[10px] text-amber-400">clipboard blocked</span>
      )}
    </div>
  );
}
