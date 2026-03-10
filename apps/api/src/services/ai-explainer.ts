import Anthropic from "@anthropic-ai/sdk";
import type { Allocation, ReserveAllocation } from "@yieldpilot/shared";
import type { PolicyConfig, ScoredStrategy } from "@yieldpilot/shared";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ExplanationResult {
  explanation: string;
  riskNotes: string[];
  confidence: "high" | "medium" | "low";
}

export async function explainRecommendation(
  allocations: Allocation[],
  reserve: ReserveAllocation,
  policy: PolicyConfig,
  allStrategies: ScoredStrategy[],
  walletBalanceUsd: number
): Promise<ExplanationResult> {
  const systemPrompt = `You are YieldPilot, an AI treasury copilot for stablecoin allocation on Solana.
Your job is to explain portfolio allocation decisions in clear, professional language.

RULES:
1. Be concise (2-3 paragraphs max)
2. Explain WHY each allocation was chosen, referencing specific policy rules
3. Highlight any tradeoffs (e.g., lower yield for lower risk)
4. Never recommend bypassing policy rules
5. Use exact numbers from the data provided
6. Sound like a treasury analyst, not a chatbot

OUTPUT FORMAT: Respond with valid JSON only:
{
  "explanation": "2-3 paragraph explanation",
  "riskNotes": ["note 1", "note 2"],
  "confidence": "high" | "medium" | "low"
}`;

  const userPrompt = `Explain this treasury allocation recommendation:

WALLET BALANCE: $${walletBalanceUsd.toLocaleString()}

POLICY RULES:
- Max exposure per venue: ${(policy.maxExposurePct * 100).toFixed(0)}%
- Min liquidity (TVL): $${(policy.minLiquidityUsd / 1_000_000).toFixed(0)}M
- Min APY: ${policy.minApyPct}%
- Reserve ratio: ${(policy.reserveRatioPct * 100).toFixed(0)}%
- Whitelisted venues: ${policy.whitelistedVenues.length > 0 ? policy.whitelistedVenues.join(", ") : "all"}

PROPOSED ALLOCATION:
${allocations.map((a) => `- ${a.vaultName} (${a.venue}): $${a.amountUsd.toLocaleString()} (${(a.pct * 100).toFixed(1)}%) — APY ${a.apyPct}%, Score ${a.score.toFixed(3)}`).join("\n")}
- Reserve (${reserve.tokenSymbol}): $${reserve.amountUsd.toLocaleString()} (${(reserve.pct * 100).toFixed(1)}%)

STRATEGIES EVALUATED: ${allStrategies.length}
${allStrategies.map((s) => `- ${s.vaultName}: APY ${s.netApyPct}%, TVL $${(s.tvlUsd / 1_000_000).toFixed(1)}M, Risk: ${s.riskTier}, Score: ${s.score.toFixed(3)}`).join("\n")}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text) as ExplanationResult;
    return parsed;
  } catch (error) {
    console.error("AI explainer error:", error);
    // Fallback explanation
    const totalAllocPct = allocations.reduce((s, a) => s + a.pct, 0);
    const weightedApy =
      allocations.reduce((s, a) => s + a.apyPct * a.pct, 0) / totalAllocPct;

    return {
      explanation: `Based on your treasury policy, YieldPilot allocated ${(totalAllocPct * 100).toFixed(0)}% of your $${walletBalanceUsd.toLocaleString()} portfolio across ${allocations.length} compliant strategies, with ${(reserve.pct * 100).toFixed(0)}% held in reserve. The projected weighted APY is ${weightedApy.toFixed(1)}%. All allocations respect your ${(policy.maxExposurePct * 100).toFixed(0)}% maximum venue exposure and ${policy.minApyPct}% minimum APY requirements.`,
      riskNotes: [
        "This is an AI-generated explanation. Always verify allocations manually.",
      ],
      confidence: "medium",
    };
  }
}
