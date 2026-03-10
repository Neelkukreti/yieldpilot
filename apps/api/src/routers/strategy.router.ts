import { router, publicProcedure } from "../trpc/trpc";
import { fetchAllStrategies } from "../services/strategy-fetcher";
import { scoreStrategies } from "../services/scoring-engine";

export const strategyRouter = router({
  list: publicProcedure.query(async () => {
    const strategies = await fetchAllStrategies();
    return scoreStrategies(strategies);
  }),
});
