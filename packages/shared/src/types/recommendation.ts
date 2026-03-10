import type { ScoreBreakdown } from "./strategy";
import type { PolicyConfig } from "./policy";

export interface Allocation {
  venue: string;
  vaultName: string;
  vaultAddress: string;
  tokenSymbol: string;
  amountUsd: number;
  pct: number;               // 0-1
  apyPct: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface ReserveAllocation {
  tokenSymbol: string;
  amountUsd: number;
  pct: number;
}

export interface RecommendationResult {
  id: string;
  policyId: string;
  walletAddress: string;
  totalAmountUsd: number;
  allocations: Allocation[];
  reserve: ReserveAllocation;
  projectedWeightedApy: number;
  aiExplanation: string;
  confidence: "high" | "medium" | "low";
  riskNotes: string[];
  scoringDetails: ScoringDetails;
  policySnapshot: PolicyConfig;
  status: RecommendationStatus;
  createdAt: Date;
  executedAt?: Date;
  txSignatures: string[];
}

export interface ScoringDetails {
  strategiesEvaluated: number;
  strategiesFiltered: number;
  strategiesSelected: number;
  filterReasons: Array<{ strategyId: string; reason: string }>;
  weights: {
    apy: number;
    liquidity: number;
    risk: number;
    stability: number;
  };
}

export type RecommendationStatus =
  | "pending"
  | "approved"
  | "executed"
  | "rejected"
  | "failed";
