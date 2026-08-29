"use client";

import type { ComponentType } from "react";
import CopyBar from "@/components/CopyBar";
import { BUSINESS } from "@/lib/registry";
import CoinStack from "./CoinStack";
import ContractSign from "./ContractSign";
import ConversionFunnel from "./ConversionFunnel";
import IdeaGears from "./IdeaGears";
import PaperPlane from "./PaperPlane";
import RocketLaunch from "./RocketLaunch";
import SecureVault from "./SecureVault";
import TargetHit from "./TargetHit";
import TaskChecklist from "./TaskChecklist";
import TeamSync from "./TeamSync";

const SCENES: Record<string, ComponentType> = {
  "rocket-launch": RocketLaunch,
  "target-hit": TargetHit,
  "coin-stack": CoinStack,
  "conversion-funnel": ConversionFunnel,
  "idea-gears": IdeaGears,
  "contract-sign": ContractSign,
  "paper-plane": PaperPlane,
  "task-checklist": TaskChecklist,
  "team-sync": TeamSync,
  "secure-vault": SecureVault,
};

export default function BusinessGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {BUSINESS.map((entry) => {
        const Scene = SCENES[entry.id];
        if (!Scene) return null;
        return (
          <figure
            key={entry.id}
            className="group overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-accent/40"
          >
            <div className="h-[132px] bg-[radial-gradient(ellipse_at_center,rgba(76,201,240,0.08),transparent_70%)]">
              <Scene />
            </div>
            <figcaption className="border-t border-line px-3 py-2.5">
              <p className="text-sm font-medium tracking-tight">{entry.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">
                {entry.description}
              </p>
              <div className="mt-2.5">
                <CopyBar entry={entry} compact />
              </div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
