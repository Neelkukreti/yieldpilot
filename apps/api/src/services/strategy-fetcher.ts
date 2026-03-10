import type { YieldStrategy } from "@yieldpilot/shared";
import type { VenueAdapter } from "../adapters/base-adapter";
import { MockKaminoAdapter } from "../adapters/mock-kamino-adapter";
import { MockMarinadeAdapter } from "../adapters/mock-marinade-adapter";

const adapters: VenueAdapter[] = [
  new MockKaminoAdapter(),
  new MockMarinadeAdapter(),
];

/**
 * Fetch strategies from all registered venue adapters.
 * Results are aggregated and sorted by net APY descending.
 */
export async function fetchAllStrategies(): Promise<YieldStrategy[]> {
  const results = await Promise.allSettled(
    adapters.map((a) => a.fetchStrategies())
  );

  const strategies: YieldStrategy[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      strategies.push(...result.value);
    } else {
      console.error("Adapter fetch failed:", result.reason);
    }
  }

  return strategies.sort((a, b) => b.netApyPct - a.netApyPct);
}
