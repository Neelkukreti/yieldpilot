import type { YieldStrategy, ScoredStrategy, ScoreBreakdown } from "../types/strategy";

export interface ScoringWeights {
  apy: number;
  liquidity: number;
  risk: number;
  stability: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  apy: 0.35,
  liquidity: 0.25,
  risk: 0.25,
  stability: 0.15,
};

const RISK_SCORES: Record<string, number> = {
  low: 1.0,
  medium: 0.6,
  high: 0.3,
};

/**
 * Score a list of strategies using a transparent weighted formula.
 * All scores are normalized to 0-1 range.
 */
export function scoreStrategies(
  strategies: YieldStrategy[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): ScoredStrategy[] {
  if (strategies.length === 0) return [];

  // Find ranges for normalization
  const apys = strategies.map((s) => s.netApyPct);
  const tvls = strategies.map((s) => s.tvlUsd);
  const maxApy = Math.max(...apys);
  const minApy = Math.min(...apys);
  const maxTvl = Math.max(...tvls);
  const minTvl = Math.min(...tvls);

  return strategies.map((strategy) => {
    // Normalize APY to 0-1
    const apyScore =
      maxApy === minApy ? 1 : (strategy.netApyPct - minApy) / (maxApy - minApy);

    // Normalize TVL using log scale
    const logTvl = Math.log10(Math.max(strategy.tvlUsd, 1));
    const logMax = Math.log10(Math.max(maxTvl, 1));
    const logMin = Math.log10(Math.max(minTvl, 1));
    const liquidityScore =
      logMax === logMin ? 1 : (logTvl - logMin) / (logMax - logMin);

    // Risk score from tier
    const riskScore = RISK_SCORES[strategy.riskTier] ?? 0.5;

    // Stability score (mock: use confidence as proxy)
    const stabilityScore = strategy.confidenceScore;

    // Weighted composite
    const total =
      apyScore * weights.apy +
      liquidityScore * weights.liquidity +
      riskScore * weights.risk +
      stabilityScore * weights.stability;

    const scoreBreakdown: ScoreBreakdown = {
      apyScore: Math.round(apyScore * 100) / 100,
      liquidityScore: Math.round(liquidityScore * 100) / 100,
      riskScore: Math.round(riskScore * 100) / 100,
      stabilityScore: Math.round(stabilityScore * 100) / 100,
      total: Math.round(total * 1000) / 1000,
    };

    return {
      ...strategy,
      score: scoreBreakdown.total,
      scoreBreakdown,
    };
  }).sort((a, b) => b.score - a.score);
}
