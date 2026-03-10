"use client";

import { trpc } from "@/lib/trpc/client";
import { formatPct, formatUsd } from "@/lib/utils";

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-red-400 bg-red-400/10",
};

export default function StrategiesPage() {
  const strategies = trpc.strategy.list.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Yield Strategies</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Available stablecoin yield opportunities across DeFi venues
        </p>
      </div>

      {strategies.isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950"
            />
          ))}
        </div>
      )}

      {strategies.data && (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-950">
              <tr className="text-left text-xs font-medium uppercase text-zinc-500">
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">APY</th>
                <th className="px-4 py-3">TVL</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {strategies.data.map((s) => (
                <tr
                  key={s.id}
                  className="bg-zinc-900/50 transition-colors hover:bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {s.vaultName}
                      </p>
                      <p className="text-xs text-zinc-500">{s.tokenSymbol}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium capitalize text-zinc-300">
                      {s.venue}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-400">
                    {formatPct(s.netApyPct)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {formatUsd(s.tvlUsd)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        RISK_COLORS[s.riskTier] ?? "text-zinc-400"
                      }`}
                    >
                      {s.riskTier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${(s.score * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400">
                        {(s.score * 100).toFixed(0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {strategies.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          Failed to load strategies. Is the API running?
        </div>
      )}
    </div>
  );
}
