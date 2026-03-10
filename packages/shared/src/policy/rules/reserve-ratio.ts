import type { PolicyRuleResult } from "../../types/policy";

/**
 * Validate that the total allocated percentage leaves enough for the reserve.
 * Called at aggregate level after allocation generation.
 */
export function validateReserveRatio(
  totalAllocatedPct: number,
  reserveRatioPct: number
): PolicyRuleResult {
  const maxAllocatable = 1 - reserveRatioPct;

  if (totalAllocatedPct > maxAllocatable + 0.001) {
    return {
      pass: false,
      reason: `Total allocation ${(totalAllocatedPct * 100).toFixed(1)}% exceeds maximum ${(maxAllocatable * 100).toFixed(1)}% (reserve requirement: ${(reserveRatioPct * 100).toFixed(1)}%)`,
    };
  }
  return { pass: true };
}
