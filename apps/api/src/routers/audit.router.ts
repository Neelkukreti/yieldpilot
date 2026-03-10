import { z } from "zod";
import { router, publicProcedure } from "../trpc/trpc";

export const auditRouter = router({
  list: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        action: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.auditEntry.findMany({
        where: {
          walletAddress: input.walletAddress,
          ...(input.action ? { action: input.action } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          policy: { select: { name: true } },
          recommendation: { select: { status: true, totalAmountUsd: true } },
        },
      });

      // Serialize to avoid deep type instantiation issues
      return entries.map((e) => ({
        id: e.id,
        walletAddress: e.walletAddress,
        action: e.action,
        details: e.details as Record<string, unknown>,
        createdAt: e.createdAt.toISOString(),
        policy: e.policy ? { name: e.policy.name } : null,
        recommendation: e.recommendation
          ? { status: e.recommendation.status, totalAmountUsd: e.recommendation.totalAmountUsd }
          : null,
      }));
    }),
});
