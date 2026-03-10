import type { StrategyForPolicy, PolicyConfig, PolicyRuleResult } from "../../types/policy";

export function checkWhitelist(
  strategy: StrategyForPolicy,
  policy: PolicyConfig
): PolicyRuleResult {
  // Empty whitelist = all venues allowed
  if (policy.whitelistedVenues.length === 0) {
    return { pass: true };
  }

  if (!policy.whitelistedVenues.includes(strategy.venue)) {
    return {
      pass: false,
      reason: `Venue "${strategy.venue}" is not in whitelist [${policy.whitelistedVenues.join(", ")}]`,
    };
  }
  return { pass: true };
}
