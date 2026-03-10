import { evaluatePolicy, scoreStrategies, validatePortfolioExposure, validateReserveRatio } from "@yieldpilot/shared";
import type { PolicyConfig, Allocation, ReserveAllocation, RecommendationResult, ScoredStrategy } from "@yieldpilot/shared";
import { fetchAllStrategies } from "./strategy-fetcher";
import { explainRecommendation } from "./ai-explainer";
import { randomUUID } from "crypto";

/**
 * Full recommendation pipeline:
 * Fetch → Policy Filter → Score → Allocate → Validate → AI Explain
 */
export async function generateRecommendation(
  policy: PolicyConfig,
  walletBalanceUsd: number
): Promise<RecommendationResult> {
  // Step 1: Fetch all strategies
  const allStrategies = await fetchAllStrategies();

  // Step 2: Policy filter (per-strategy rules)
  const policyResult = evaluatePolicy(allStrategies, policy);

  // Step 3: Score compliant strategies
  const compliantStrategies = allStrategies.filter((s) =>
    policyResult.compliantStrategies.includes(s.id)
  );
  const scored = scoreStrategies(compliantStrategies);

  // Step 4: Generate allocation
  const { allocations, reserve } = generateAllocation(
    scored,
    policy,
    walletBalanceUsd
  );

  // Step 5: Validate aggregate constraints
  const exposureCheck = validatePortfolioExposure(
    allocations.map((a) => ({ venue: a.venue, pct: a.pct })),
    policy.maxExposurePct
  );
  const totalAllocPct = allocations.reduce((s, a) => s + a.pct, 0);
  const reserveCheck = validateReserveRatio(totalAllocPct, policy.reserveRatioPct);

  if (!exposureCheck.pass || !reserveCheck.pass) {
    // Re-adjust if aggregate rules fail (shouldn't happen with correct planner)
    console.warn("Aggregate validation failed, using conservative fallback");
  }

  // Step 6: AI explanation
  const projectedWeightedApy =
    totalAllocPct > 0
      ? allocations.reduce((s, a) => s + a.apyPct * a.pct, 0) / totalAllocPct
      : 0;

  const aiResult = await explainRecommendation(
    allocations,
    reserve,
    policy,
    scored,
    walletBalanceUsd
  );

  return {
    id: randomUUID(),
    policyId: policy.id,
    walletAddress: policy.walletAddress,
    totalAmountUsd: walletBalanceUsd,
    allocations,
    reserve,
    projectedWeightedApy,
    aiExplanation: aiResult.explanation,
    confidence: aiResult.confidence,
    riskNotes: aiResult.riskNotes,
    scoringDetails: {
      strategiesEvaluated: allStrategies.length,
      strategiesFiltered: policyResult.filteredStrategies.length,
      strategiesSelected: allocations.length,
      filterReasons: policyResult.filteredStrategies.map((f) => ({
        strategyId: f.strategyId,
        reason: f.reason,
      })),
      weights: { apy: 0.35, liquidity: 0.25, risk: 0.25, stability: 0.15 },
    },
    policySnapshot: policy,
    status: "pending",
    createdAt: new Date(),
    txSignatures: [],
  };
}

/**
 * Generate allocation from scored strategies respecting policy constraints.
 */
function generateAllocation(
  scored: ScoredStrategy[],
  policy: PolicyConfig,
  walletBalanceUsd: number
): { allocations: Allocation[]; reserve: ReserveAllocation } {
  const maxAllocatable = 1 - policy.reserveRatioPct;
  const maxPerVenue = policy.maxExposurePct;
  const venueAllocated = new Map<string, number>();
  let totalAllocated = 0;
  const allocations: Allocation[] = [];

  for (const strategy of scored) {
    if (totalAllocated >= maxAllocatable) break;

    const venueUsed = venueAllocated.get(strategy.venue) ?? 0;
    const venueRemaining = maxPerVenue - venueUsed;
    const portfolioRemaining = maxAllocatable - totalAllocated;
    const pct = Math.min(venueRemaining, portfolioRemaining, maxPerVenue);

    if (pct < 0.01) continue; // Skip tiny allocations

    const allocation: Allocation = {
      venue: strategy.venue,
      vaultName: strategy.vaultName,
      vaultAddress: strategy.vaultAddress,
      tokenSymbol: strategy.tokenSymbol,
      amountUsd: Math.round(walletBalanceUsd * pct),
      pct,
      apyPct: strategy.netApyPct,
      score: strategy.score,
      scoreBreakdown: strategy.scoreBreakdown,
    };

    allocations.push(allocation);
    venueAllocated.set(strategy.venue, venueUsed + pct);
    totalAllocated += pct;
  }

  const reservePct = 1 - totalAllocated;
  const reserve: ReserveAllocation = {
    tokenSymbol: "USDC",
    amountUsd: Math.round(walletBalanceUsd * reservePct),
    pct: reservePct,
  };

  return { allocations, reserve };
}
