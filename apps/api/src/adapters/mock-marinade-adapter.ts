import type { YieldStrategy } from "@yieldpilot/shared";
import type { VenueAdapter } from "./base-adapter";

export class MockMarinadeAdapter implements VenueAdapter {
  venue = "marinade";

  async fetchStrategies(): Promise<YieldStrategy[]> {
    return [
      {
        id: "marinade-usdc-staking",
        venue: "marinade",
        vaultName: "Marinade USDC Staking",
        vaultAddress: "MrndUSDCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        tokenSymbol: "USDC",
        strategyType: "staking",
        apyPct: 4.2,
        netApyPct: 3.8,
        tvlUsd: 65_000_000,
        availableLiquidityUsd: 20_000_000,
        withdrawalLatency: "1-epoch",
        riskTier: "low",
        riskTags: ["audited", "battle-tested", "liquid-staking"],
        minDeposit: 1,
        maxCapacity: 200_000_000,
        confidenceScore: 0.97,
        metadata: { audited: true, ageDays: 500, protocol: "Marinade Finance" },
        fetchedAt: new Date(),
      },
      {
        id: "marinade-usdt-vault",
        venue: "marinade",
        vaultName: "Marinade USDT Vault",
        vaultAddress: "MrndUSDTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        tokenMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        tokenSymbol: "USDT",
        strategyType: "staking",
        apyPct: 3.6,
        netApyPct: 3.2,
        tvlUsd: 22_000_000,
        availableLiquidityUsd: 7_000_000,
        withdrawalLatency: "1-epoch",
        riskTier: "low",
        riskTags: ["audited", "battle-tested"],
        minDeposit: 1,
        maxCapacity: 100_000_000,
        confidenceScore: 0.94,
        metadata: { audited: true, ageDays: 400, protocol: "Marinade Finance" },
        fetchedAt: new Date(),
      },
    ];
  }
}
