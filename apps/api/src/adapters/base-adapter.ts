import type { YieldStrategy } from "@yieldpilot/shared";

export interface VenueAdapter {
  venue: string;
  fetchStrategies(): Promise<YieldStrategy[]>;
}
