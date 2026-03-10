import type { StrategyForPolicy, PolicyConfig, PolicyRuleResult } from "../../types/policy";

export function checkMinLiquidity(
  strategy: StrategyForPolicy,
  policy: PolicyConfig
): PolicyRuleResult {
  if (strategy.tvlUsd < policy.minLiquidityUsd) {
    return {
      pass: false,
      reason: `TVL $${(strategy.tvlUsd / 1_000_000).toFixed(1)}M is below minimum $${(policy.minLiquidityUsd / 1_000_000).toFixed(1)}M`,
    };
  }
  return { pass: true };
}
