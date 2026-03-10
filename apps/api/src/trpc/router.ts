import { router } from "./trpc";
import { policyRouter } from "../routers/policy.router";
import { strategyRouter } from "../routers/strategy.router";
import { recommendationRouter } from "../routers/recommendation.router";
import { auditRouter } from "../routers/audit.router";

export const appRouter = router({
  policy: policyRouter,
  strategy: strategyRouter,
  recommendation: recommendationRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
