import type { StrategyForPolicy, PolicyConfig, PolicyRuleResult } from "../../types/policy";

export function checkMinApy(
  strategy: StrategyForPolicy,
  policy: PolicyConfig
): PolicyRuleResult {
  if (strategy.apyPct < policy.minApyPct) {
    return {
      pass: false,
      reason: `APY ${strategy.apyPct.toFixed(2)}% is below minimum ${policy.minApyPct.toFixed(2)}%`,
    };
  }
  return { pass: true };
}
