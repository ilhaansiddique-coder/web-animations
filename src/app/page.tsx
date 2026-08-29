"use client";

import dynamic from "next/dynamic";
import AnimationCard from "@/components/AnimationCard";
import BusinessGrid from "@/components/business/BusinessGrid";
import CopyBar from "@/components/CopyBar";
import GrowthChart from "@/components/GrowthChart";
import HeroDashboard from "@/components/HeroDashboard";
import LogoMarquee from "@/components/LogoMarquee";
import NetworkConstellation from "@/components/NetworkConstellation";
import WireGlobe from "@/components/WireGlobe";
import WorldFlightMap from "@/components/WorldFlightMap";
import { FEATURED } from "@/lib/registry";

// WebGL scenes are browser-only and heavy — never server render them.
const Globe = dynamic(() => import("@/components/three/Globe"), { ssr: false });

const byId = Object.fromEntries(FEATURED.map((e) => [e.id, e]));

export default function Home() {
  return (
    <main className="relative flex-1 overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-grid" />

      {/* Wire globe sits behind the hero copy, as on the reference layout */}
      <div className="pointer-events-none absolute left-[-6%] top-[2%] h-[min(560px,80vw)] w-[min(560px,80vw)] opacity-[0.5] lg:left-[6%] lg:h-[560px] lg:w-[560px]">
        <WireGlobe color="76, 201, 240" period={30} intensity={0.9} />
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-6 py-14 sm:py-20">
        {/* ------------------------------------------------------------ hero */}
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <header>
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              web animation kit
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Animated web elements,
              <br />
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
                drop-in components.
              </span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              A live order board, two globes, charts, tickers and ten flat
              business loops. Every animation hands you three things: the setup,
              an AI prompt to rebuild or remix it, and the component source.
            </p>

            <div className="mt-7 rounded-xl border border-line bg-panel p-4">
              <p className="text-sm font-medium tracking-tight">
                {byId["hero-dashboard"].title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                The cluster on the right — pure CSS keyframes, no timers.
              </p>
              <div className="mt-3">
                <CopyBar entry={byId["hero-dashboard"]} />
              </div>
            </div>
          </header>

          <div className="min-w-0">
            <HeroDashboard />
          </div>
        </section>

        {/* -------------------------------------------------------- gallery */}
        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <AnimationCard entry={byId["world-flight-map"]} height="h-[520px]">
              <WorldFlightMap />
            </AnimationCard>
          </div>

          <AnimationCard entry={byId["route-globe"]} height="h-[440px]">
            <Globe />
          </AnimationCard>

          <AnimationCard entry={byId["wire-globe"]} height="h-[440px]">
            <div className="h-full w-full p-4">
              <WireGlobe />
            </div>
          </AnimationCard>

          <AnimationCard entry={byId["growth-chart"]} height="h-[248px]">
            <GrowthChart />
          </AnimationCard>

          <AnimationCard entry={byId["node-constellation"]} height="h-[248px]">
            <NetworkConstellation />
          </AnimationCard>

          <div className="lg:col-span-2">
            <AnimationCard entry={byId["logo-marquee"]} height="h-[110px]">
              <LogoMarquee />
            </AnimationCard>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Business animation set
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Flat looping scenes in the LottieFiles vein — but authored as SVG
                + Motion in this theme, so there is no JSON to ship, no player
                dependency, and every colour is a token you already own.
              </p>
            </div>
            <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted">
              10 scenes · ~4 KB each
            </span>
          </div>

          <div className="mt-8">
            <BusinessGrid />
          </div>
        </section>

        <footer className="mt-16 border-t border-line pt-6 font-mono text-xs text-muted">
          next.js · tailwind v4 · react-three-fiber · motion
        </footer>
      </div>
    </main>
  );
}
