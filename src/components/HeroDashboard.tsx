"use client";

import styles from "./HeroDashboard.module.css";

/**
 * Hero dashboard cluster — a tilted order board that floats while its rows run
 * on a CSS conveyor, three KPI chips drifting above it, and a courier rail with
 * a package riding a dashed flow path into a delivery pulse.
 *
 * Every loop is a CSS keyframe: no timers, no state, nothing to hydrate. Six
 * rows share one 24s animation offset by -3s each, so five slots are always
 * filled while the sixth is entering or leaving.
 */

const STATS = [
  { label: "Orders today", value: "241", delta: "18%", tone: "ok" as const, icon: bagIcon },
  { label: "COD collected", value: "$89,520", delta: "22%", tone: "warn" as const, icon: coinIcon },
  { label: "Delivery rate", value: "96.8%", delta: "9%", tone: "ok" as const, icon: checkIcon },
];

const NAV = [
  "Dashboard",
  "Orders",
  "Products",
  "Courier",
  "Payments",
  "Reports",
  "Settings",
];

const FILTERS = [
  { label: "All orders", count: "241", on: true },
  { label: "New", count: "56", on: false },
  { label: "Processing", count: "87", on: false },
  { label: "Delivered", count: "27", on: false },
];

type Status = "Delivered" | "Pickup" | "Processing" | "New";

const STATUS_TONE: Record<Status, { bg: string; fg: string }> = {
  Delivered: { bg: "var(--ok-soft)", fg: "var(--ok)" },
  Pickup: { bg: "var(--warn-soft)", fg: "var(--warn)" },
  Processing: { bg: "var(--accent-soft)", fg: "var(--accent)" },
  New: { bg: "rgba(139,147,167,0.14)", fg: "var(--muted)" },
};

const ORDERS: {
  id: string;
  name: string;
  phone: string;
  source: string;
  amount: string;
  status: Status;
  courier: string;
  mark: string;
  score: number;
}[] = [
  { id: "10326", name: "Sakib Hossen", phone: "01762 29764", source: "Organic", amount: "$1,850", status: "Delivered", courier: "Metro", mark: "MT", score: 96 },
  { id: "10325", name: "Nusrat Jahan", phone: "01489 71848", source: "Facebook", amount: "$890", status: "Pickup", courier: "Carrybee", mark: "CB", score: 88 },
  { id: "10324", name: "Mehedi Hasan", phone: "01655 78629", source: "Retargeting", amount: "$1,450", status: "Processing", courier: "Steadfast", mark: "SF", score: 100 },
  { id: "10323", name: "Tania Rahman", phone: "01744 26689", source: "Instagram", amount: "$970", status: "New", courier: "Metro", mark: "MT", score: 92 },
  { id: "10322", name: "Farhana Akter", phone: "01326 90349", source: "Messenger", amount: "$1,780", status: "Pickup", courier: "Carrybee", mark: "CB", score: 99 },
  { id: "10321", name: "Imran Kabir", phone: "01833 12907", source: "Organic", amount: "$2,120", status: "Delivered", courier: "Steadfast", mark: "SF", score: 94 },
  { id: "10320", name: "Rumana Haque", phone: "01912 44508", source: "Facebook", amount: "$640", status: "Processing", courier: "Metro", mark: "MT", score: 86 },
  { id: "10319", name: "Arif Chowdhury", phone: "01571 83320", source: "Organic", amount: "$3,050", status: "New", courier: "Carrybee", mark: "CB", score: 97 },
];

// Eight rows at -3s apart cover the full 24s cycle, so five slots stay filled.
const ROW_STAGGER = 3;

const RAIL = [
  { tag: "SF", name: "Steadfast" },
  { tag: "PA", name: "Pathao" },
  { tag: "CB", name: "Carrybee" },
];

const FLOW_PATH =
  "M48 4 C48 44 48 70 48 100 L48 190 L48 268 C48 292 48 306 48 316";

function scoreTone(score: number) {
  if (score >= 95) return { background: "var(--ok-soft)", color: "var(--ok)" };
  if (score >= 88) return { background: "var(--warn-soft)", color: "var(--warn)" };
  return { background: "rgba(139,147,167,0.14)", color: "var(--muted)" };
}

export default function HeroDashboard({
  theme = "dark",
}: {
  /** "light" switches to the green/white palette this layout is modelled on. */
  theme?: "dark" | "light";
}) {
  return (
    <div className={`${styles.cluster} ${theme === "light" ? styles.light : ""}`}>
      {/* KPI chips float above the panel, offset half a second apart */}
      <div className={styles.stats}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={styles.stat}
            style={{ "--fd": `${i * 0.5}s` } as React.CSSProperties}
          >
            <span
              className={styles.statIcon}
              style={{ background: stat.tone === "ok" ? "var(--ok)" : "var(--warn)" }}
            >
              {stat.icon()}
            </span>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statRow}>
                <b className={styles.statValue}>{stat.value}</b>
                <span className={styles.statUp}>▲ {stat.delta}</span>
              </span>
              <span className={styles.statSub}>vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tilted order board */}
      <div className={styles.panel}>
        <aside className={styles.side}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>{bagIcon()}</span>
            Store
          </div>
          {NAV.map((item, i) => (
            <div
              key={item}
              className={`${styles.nav} ${i === 1 ? styles.navOn : ""}`}
            >
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                <rect
                  x="2.5"
                  y="2.5"
                  width="11"
                  height="11"
                  rx="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              {item}
            </div>
          ))}
        </aside>

        <div className={styles.main}>
          <div className={styles.head}>
            <span className={styles.title}>Order board</span>
            <span className={styles.live}>
              <span className={styles.liveDot} />
              LIVE
            </span>
          </div>

          <div className={styles.tools}>
            <span className={styles.tool}>
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
                <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
              </svg>
              Today
            </span>
            <span className={styles.tool}>
              All status
              <svg viewBox="0 0 16 16" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M4 6.5 8 10.5 12 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={`${styles.tool} ${styles.search}`}>
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <circle cx="7" cy="7" r="4.2" />
                <path d="M10.2 10.2 13.5 13.5" strokeLinecap="round" />
              </svg>
              Search by customer name or phone…
            </span>
          </div>

          <div className={styles.chips}>
            {FILTERS.map((f) => (
              <span
                key={f.label}
                className={`${styles.chip} ${f.on ? styles.chipOn : ""}`}
              >
                {f.label} {f.count}
              </span>
            ))}
          </div>

          <div className={styles.tableHead}>
            <span>#</span>
            <span>Customer</span>
            <span style={{ textAlign: "right" }}>Total</span>
            <span>Status</span>
            <span>Courier</span>
            <span style={{ textAlign: "center" }}>Score</span>
          </div>

          <div className={styles.feed}>
            {ORDERS.map((order, i) => (
              <div
                key={order.id}
                className={styles.row}
                style={
                  {
                    "--fd": `${-ROW_STAGGER * i}s`,
                    "--slot": i,
                  } as React.CSSProperties
                }
              >
                <span className={styles.id}>
                  <span className={styles.radio} />#{order.id}
                </span>
                <span className={styles.cust}>
                  <span className={styles.custName}>{order.name}</span>
                  <span className={styles.custMeta}>
                    {order.phone}
                    <span className={styles.source}>{order.source}</span>
                  </span>
                </span>
                <span className={styles.amt}>{order.amount}</span>
                <span
                  className={styles.status}
                  style={{
                    background: STATUS_TONE[order.status].bg,
                    color: STATUS_TONE[order.status].fg,
                  }}
                >
                  {order.status}
                </span>
                <span className={styles.courier}>
                  <span className={styles.courierMark}>{order.mark}</span>
                  {order.courier}
                </span>
                <span className={styles.score} style={scoreTone(order.score)}>
                  {order.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courier rail: dashed flow with a package riding it into the drop-off */}
      <div className={styles.rail}>
        <svg className={styles.flow} viewBox="0 0 96 330" fill="none" aria-hidden>
          <path id="hd-flowpath" className={styles.flowPath} d={FLOW_PATH} />
          <path className={styles.flowDash} d={FLOW_PATH} />
          <g className={styles.pkg}>
            <rect x="-6" y="-6" width="12" height="12" rx="3" />
            <line x1="-6" y1="0" x2="6" y2="0" />
            <animateMotion
              dur="4.8s"
              repeatCount="indefinite"
              rotate="auto"
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.5 0 0.5 1"
            >
              <mpath href="#hd-flowpath" />
            </animateMotion>
          </g>
        </svg>

        <div className={styles.railCards}>
          {RAIL.map((item, i) => (
            <div
              key={item.tag}
              className={styles.railCard}
              style={{ "--fd": `${i * 0.4}s` } as React.CSSProperties}
            >
              <span>{item.tag}</span>
              {item.name}
            </div>
          ))}

          <div className={styles.received}>
            <span className={styles.receivedRing} />
            {homeIcon()}
            <span className={styles.receivedLabel}>Received</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- icons -- */

function bagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function coinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4" />
    </svg>
  );
}

function checkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

function homeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <rect x="9.5" y="13" width="5" height="4" rx="1" />
    </svg>
  );
}
