export interface YieldStrategy {
  id: string;
  venue: string;             // "kamino" | "marinade"
  vaultName: string;
  vaultAddress: string;
  tokenMint: string;         // USDC or USDT mint address
  tokenSymbol: string;       // "USDC" | "USDT"
  strategyType: string;      // "lending" | "liquidity" | "staking"
  apyPct: number;            // gross APY as percentage (e.g., 5.2)
  netApyPct: number;         // net after fees
  tvlUsd: number;            // total value locked in USD
  availableLiquidityUsd: number;
  withdrawalLatency: string; // "instant" | "1-epoch" | "24h"
  riskTier: RiskTier;
  riskTags: string[];        // ["audited", "battle-tested", "new"]
  minDeposit: number;        // in token units
  maxCapacity: number;       // max deposit capacity in USD
  confidenceScore: number;   // 0-1, data freshness/reliability
  metadata: Record<string, unknown>;
  fetchedAt: Date;
}

export type RiskTier = "low" | "medium" | "high";

export interface ScoredStrategy extends YieldStrategy {
  score: number;             // 0-1 composite score
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  apyScore: number;
  liquidityScore: number;
  riskScore: number;
  stabilityScore: number;
  total: number;
}

export interface VenueInfo {
  id: string;
  name: string;
  displayName: string;
  color: string;             // for UI badge
  icon?: string;
  website: string;
  isAudited: boolean;
}

export const VENUES: Record<string, VenueInfo> = {
  kamino: {
    id: "kamino",
    name: "kamino",
    displayName: "Kamino Finance",
    color: "#4F46E5",
    website: "https://app.kamino.finance",
    isAudited: true,
  },
  marinade: {
    id: "marinade",
    name: "marinade",
    displayName: "Marinade Finance",
    color: "#22C55E",
    website: "https://marinade.finance",
    isAudited: true,
  },
};
