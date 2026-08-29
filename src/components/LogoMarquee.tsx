"use client";

const ITEMS = [
  { tag: "Courier sync", mark: "M2 8 H14 M14 8 L10 4 M14 8 L10 12" },
  { tag: "COD capture", mark: "M3 4 H13 V12 H3 Z M3 7 H13" },
  { tag: "Live tracking", mark: "M8 2 A6 6 0 1 0 8 14 A6 6 0 1 0 8 2 M8 5 V8 L10 10" },
  { tag: "SMS alerts", mark: "M2 4 H14 V11 H8 L5 14 V11 H2 Z" },
  { tag: "Fraud score", mark: "M8 2 L14 5 V9 C14 12 8 14 8 14 C8 14 2 12 2 9 V5 Z" },
  { tag: "Bangla + EN", mark: "M2 8 H14 M8 2 V14 M4 4 C6 8 6 8 4 12 M12 4 C10 8 10 8 12 12" },
  { tag: "Auto invoice", mark: "M4 2 H12 V14 L10 12 L8 14 L6 12 L4 14 Z M6 6 H10" },
  { tag: "Stock sync", mark: "M2 5 L8 2 L14 5 V11 L8 14 L2 11 Z M8 8 L14 5 M8 8 V14 M8 8 L2 5" },
];

/**
 * Edge-faded infinite ticker. The track holds two copies of the list and slides
 * exactly half its width, so the seam never shows.
 */
export default function LogoMarquee() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="group relative flex h-full items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
      <div className="animate-[marquee_26s_linear_infinite] flex w-max gap-3 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {track.map((item, i) => (
          <span
            key={`${item.tag}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-panel px-3.5 py-2 text-xs text-muted"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0">
              <path
                d={item.mark}
                fill="none"
                stroke="#4cc9f0"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {item.tag}
          </span>
        ))}
      </div>
    </div>
  );
}
