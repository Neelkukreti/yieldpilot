import type {
  PolicyConfig,
  PolicyCheckResult,
  PolicyViolation,
  FilteredStrategy,
  StrategyForPolicy,
} from "../types/policy";
import { checkMinLiquidity } from "./rules/min-liquidity";
import { checkMinApy } from "./rules/min-apy";
import { checkWhitelist } from "./rules/whitelist";

type RuleCheck = (
  strategy: StrategyForPolicy,
  policy: PolicyConfig
) => { pass: boolean; reason?: string };

const INDIVIDUAL_RULES: Array<{ name: string; check: RuleCheck }> = [
  { name: "whitelist", check: checkWhitelist },
  { name: "min-liquidity", check: checkMinLiquidity },
  { name: "min-apy", check: checkMinApy },
];

/**
 * Evaluate all strategies against a policy.
 * Filters out non-compliant strategies and records why each was filtered.
 *
 * NOTE: This only runs per-strategy rules. Aggregate rules (max-exposure,
 * reserve-ratio) are validated after allocation generation.
 */
export function evaluatePolicy(
  strategies: StrategyForPolicy[],
  policy: PolicyConfig
): PolicyCheckResult {
  const violations: PolicyViolation[] = [];
  const filteredStrategies: FilteredStrategy[] = [];
  const compliantIds: string[] = [];

  for (const strategy of strategies) {
    let isCompliant = true;

    for (const rule of INDIVIDUAL_RULES) {
      const result = rule.check(strategy, policy);
      if (!result.pass) {
        isCompliant = false;
        const reason = result.reason ?? `Failed ${rule.name} check`;
        violations.push({
          rule: rule.name,
          strategyId: strategy.id,
          message: reason,
        });
        filteredStrategies.push({
          strategyId: strategy.id,
          strategyName: strategy.vaultName,
          rule: rule.name,
          reason,
        });
        break; // First failure is enough to filter
      }
    }

    if (isCompliant) {
      compliantIds.push(strategy.id);
    }
  }

  return {
    passed: compliantIds.length > 0,
    violations,
    compliantStrategies: compliantIds,
    filteredStrategies,
  };
}
