import { z } from "zod";
import { router, publicProcedure } from "../trpc/trpc";

export const policyRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        walletAddress: z.string().min(1),
        maxExposurePct: z.number().min(0.05).max(1),
        minLiquidityUsd: z.number().min(0),
        minApyPct: z.number().min(0),
        reserveRatioPct: z.number().min(0).max(0.9),
        whitelistedVenues: z.array(z.string()).default([]),
        allowedAssets: z.array(z.string()).default(["USDC", "USDT"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Deactivate existing policies for this wallet
      await ctx.db.policy.updateMany({
        where: { walletAddress: input.walletAddress, isActive: true },
        data: { isActive: false },
      });

      const policy = await ctx.db.policy.create({ data: input });

      await ctx.db.auditEntry.create({
        data: {
          walletAddress: input.walletAddress,
          action: "policy_created",
          policyId: policy.id,
          details: input,
        },
      });

      return policy;
    }),

  getActive: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.policy.findFirst({
        where: { walletAddress: input.walletAddress, isActive: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  list: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.policy.findMany({
        where: { walletAddress: input.walletAddress },
        orderBy: { createdAt: "desc" },
      });
    }),
});
