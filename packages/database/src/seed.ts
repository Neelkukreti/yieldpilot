import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed mock strategies
  const strategies = [
    {
      venue: "kamino",
      vaultName: "Kamino USDC Lending",
      vaultAddress: "KmnUSDCv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      tokenSymbol: "USDC",
      strategyType: "lending",
      apyPct: 5.8,
      netApyPct: 5.2,
      tvlUsd: 45_000_000,
      riskTier: "low",
      metadata: { audited: true, age_days: 365 },
    },
    {
      venue: "kamino",
      vaultName: "Kamino USDT Lending",
      vaultAddress: "KmnUSDTv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      tokenSymbol: "USDT",
      strategyType: "lending",
      apyPct: 4.9,
      netApyPct: 4.4,
      tvlUsd: 28_000_000,
      riskTier: "low",
      metadata: { audited: true, age_days: 300 },
    },
    {
      venue: "kamino",
      vaultName: "Kamino USDC-USDT LP",
      vaultAddress: "KmnLPv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      tokenSymbol: "USDC",
      strategyType: "liquidity",
      apyPct: 8.2,
      netApyPct: 7.1,
      tvlUsd: 12_000_000,
      riskTier: "medium",
      metadata: { audited: true, age_days: 180, impermanent_loss_risk: true },
    },
    {
      venue: "kamino",
      vaultName: "Kamino USDC Multiply",
      vaultAddress: "KmnMULv1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      tokenSymbol: "USDC",
      strategyType: "lending",
      apyPct: 12.5,
      netApyPct: 10.8,
      tvlUsd: 3_500_000,
      riskTier: "high",
      metadata: { audited: true, age_days: 90, leveraged: true },
    },
    {
      venue: "marinade",
      vaultName: "Marinade USDC Staking",
      vaultAddress: "MrndUSDCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      tokenSymbol: "USDC",
      strategyType: "staking",
      apyPct: 4.2,
      netApyPct: 3.8,
      tvlUsd: 65_000_000,
      riskTier: "low",
      metadata: { audited: true, age_days: 500 },
    },
    {
      venue: "marinade",
      vaultName: "Marinade USDT Vault",
      vaultAddress: "MrndUSDTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      tokenSymbol: "USDT",
      strategyType: "staking",
      apyPct: 3.6,
      netApyPct: 3.2,
      tvlUsd: 22_000_000,
      riskTier: "low",
      metadata: { audited: true, age_days: 400 },
    },
  ];

  for (const strategy of strategies) {
    await prisma.strategy.upsert({
      where: { id: `seed-${strategy.vaultAddress}` },
      update: { ...strategy },
      create: { id: `seed-${strategy.vaultAddress}`, ...strategy },
    });
  }

  console.log(`Seeded ${strategies.length} strategies`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
