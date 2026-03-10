import { z } from "zod";
import { router, publicProcedure } from "../trpc/trpc";
import { generateRecommendation } from "../services/recommendation";
import type { PolicyConfig } from "@yieldpilot/shared";

export const recommendationRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        walletBalanceUsd: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get active policy
      const policy = await ctx.db.policy.findFirst({
        where: { walletAddress: input.walletAddress, isActive: true },
      });

      if (!policy) {
        throw new Error("No active policy found. Create a policy first.");
      }

      // Generate recommendation
      const policyConfig: PolicyConfig = {
        ...policy,
        whitelistedVenues: policy.whitelistedVenues,
        allowedAssets: policy.allowedAssets,
      };

      const result = await generateRecommendation(
        policyConfig,
        input.walletBalanceUsd
      );

      // Persist to database
      const saved = await ctx.db.recommendation.create({
        data: {
          policyId: policy.id,
          walletAddress: input.walletAddress,
          totalAmountUsd: input.walletBalanceUsd,
          allocations: JSON.parse(JSON.stringify(result.allocations)),
          aiExplanation: result.aiExplanation,
          scoringDetails: JSON.parse(JSON.stringify(result.scoringDetails)),
          policySnapshot: JSON.parse(JSON.stringify(policyConfig)),
          status: "pending",
        },
      });

      // Audit
      await ctx.db.auditEntry.create({
        data: {
          walletAddress: input.walletAddress,
          action: "recommendation_generated",
          policyId: policy.id,
          recommendationId: saved.id,
          details: {
            strategiesEvaluated: result.scoringDetails.strategiesEvaluated,
            strategiesSelected: result.scoringDetails.strategiesSelected,
            projectedApy: result.projectedWeightedApy,
          },
        },
      });

      return { ...result, id: saved.id };
    }),

  approve: publicProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const rec = await ctx.db.recommendation.update({
        where: { id: input.recommendationId },
        data: { status: "approved" },
      });

      await ctx.db.auditEntry.create({
        data: {
          walletAddress: rec.walletAddress,
          action: "recommendation_approved",
          recommendationId: rec.id,
          details: {},
        },
      });

      return rec;
    }),

  list: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      const recs = await ctx.db.recommendation.findMany({
        where: { walletAddress: input.walletAddress },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return recs.map((r) => ({
        id: r.id,
        status: r.status,
        totalAmountUsd: r.totalAmountUsd,
        aiExplanation: r.aiExplanation,
        createdAt: r.createdAt.toISOString(),
      }));
    }),
});
