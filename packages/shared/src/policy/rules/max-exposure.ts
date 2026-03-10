import type { StrategyForPolicy, PolicyConfig, PolicyRuleResult } from "../../types/policy";

export function checkMaxExposure(
  strategy: StrategyForPolicy,
  _policy: PolicyConfig
): PolicyRuleResult {
  // Individual strategy check is always pass — exposure is checked at portfolio level
  return { pass: true };
}

/**
 * Validate that no single venue exceeds maxExposurePct of total portfolio.
 * Called at aggregate level after allocation generation.
 */
export function validatePortfolioExposure(
  allocations: Array<{ venue: string; pct: number }>,
  maxExposurePct: number
): PolicyRuleResult {
  const venueExposure = new Map<string, number>();

  for (const alloc of allocations) {
    const current = venueExposure.get(alloc.venue) ?? 0;
    venueExposure.set(alloc.venue, current + alloc.pct);
  }

  for (const [venue, pct] of venueExposure) {
    if (pct > maxExposurePct) {
      return {
        pass: false,
        reason: `${venue} exposure is ${(pct * 100).toFixed(1)}%, exceeds max ${(maxExposurePct * 100).toFixed(1)}%`,
      };
    }
  }

  return { pass: true };
}
