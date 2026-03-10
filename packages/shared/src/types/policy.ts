export interface PolicyConfig {
  id: string;
  name: string;
  walletAddress: string;
  maxExposurePct: number;      // max % in single venue (0-1)
  minLiquidityUsd: number;     // min TVL in USD
  minApyPct: number;           // min net APY (0-100)
  reserveRatioPct: number;     // keep N% idle in wallet (0-1)
  whitelistedVenues: string[]; // empty = allow all
  allowedAssets: string[];     // ["USDC", "USDT"]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRule {
  name: string;
  evaluate: (strategy: StrategyForPolicy, policy: PolicyConfig) => PolicyRuleResult;
}

export interface PolicyRuleResult {
  pass: boolean;
  reason?: string;
}

export interface PolicyCheckResult {
  passed: boolean;
  violations: PolicyViolation[];
  compliantStrategies: string[]; // strategy IDs that passed
  filteredStrategies: FilteredStrategy[];
}

export interface PolicyViolation {
  rule: string;
  strategyId?: string;
  message: string;
}

export interface FilteredStrategy {
  strategyId: string;
  strategyName: string;
  rule: string;
  reason: string;
}

// Minimal strategy shape needed by policy engine
export interface StrategyForPolicy {
  id: string;
  venue: string;
  vaultName: string;
  tokenMint: string;
  apyPct: number;
  tvlUsd: number;
}

export type PolicyPreset = "conservative" | "balanced" | "aggressive";
