import type { PolicyPreset } from "../types/policy";

export interface PolicyPresetConfig {
  name: string;
  description: string;
  maxExposurePct: number;
  minLiquidityUsd: number;
  minApyPct: number;
  reserveRatioPct: number;
}

export const POLICY_PRESETS: Record<PolicyPreset, PolicyPresetConfig> = {
  conservative: {
    name: "Conservative",
    description: "Maximum safety with strict diversification and high reserves",
    maxExposurePct: 0.2,
    minLiquidityUsd: 10_000_000,
    minApyPct: 2.0,
    reserveRatioPct: 0.3,
  },
  balanced: {
    name: "Balanced",
    description: "Balanced risk-reward with moderate diversification",
    maxExposurePct: 0.4,
    minLiquidityUsd: 1_000_000,
    minApyPct: 3.0,
    reserveRatioPct: 0.1,
  },
  aggressive: {
    name: "Aggressive",
    description: "Higher yield tolerance with lower reserve requirements",
    maxExposurePct: 0.6,
    minLiquidityUsd: 500_000,
    minApyPct: 1.0,
    reserveRatioPct: 0.05,
  },
};
