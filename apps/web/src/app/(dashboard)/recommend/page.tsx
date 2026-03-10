"use client";

import { useState } from "react";
import { useWalletAddress } from "@/components/wallet/connect-button";
import { trpc } from "@/lib/trpc/client";
import { formatPct, formatUsd } from "@/lib/utils";

export default function RecommendPage() {
  const walletAddress = useWalletAddress();
  const utils = trpc.useUtils();
  const [balanceInput, setBalanceInput] = useState("10000");

  const generate = trpc.recommendation.generate.useMutation();
  const approve = trpc.recommendation.approve.useMutation({
    onSuccess: () => utils.recommendation.list.invalidate(),
  });
  const history = trpc.recommendation.list.useQuery(
    { walletAddress: walletAddress! },
    { enabled: !!walletAddress }
  );

  if (!walletAddress) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Connect your wallet to get recommendations
      </div>
    );
  }

  const result = generate.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Optimize Treasury</h2>
        <p className="mt-1 text-sm text-zinc-400">
          AI-powered allocation recommendation based on your policy
        </p>
      </div>

      {/* Generate */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-zinc-300">
              Wallet Balance (USD)
            </label>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() =>
              generate.mutate({
                walletAddress,
                walletBalanceUsd: Number(balanceInput),
              })
            }
            disabled={generate.isPending}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {generate.isPending ? "Generating..." : "Optimize"}
          </button>
        </div>
      </div>

      {generate.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {generate.error.message}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Allocations */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white">
              Recommended Allocation
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Projected weighted APY:{" "}
              <span className="text-emerald-400">
                {formatPct(result.projectedWeightedApy)}
              </span>
            </p>

            <div className="mt-4 space-y-3">
              {result.allocations.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {a.vaultName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {a.venue} &middot; {formatPct(a.apyPct)} APY
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {formatUsd(a.amountUsd)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatPct(a.pct * 100)} of portfolio
                    </p>
                  </div>
                </div>
              ))}

              {result.reserve && (
                <div className="flex items-center justify-between rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      Reserve (idle)
                    </p>
                    <p className="text-xs text-zinc-500">Kept in wallet</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-300">
                      {formatUsd(result.reserve.amountUsd)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatPct(result.reserve.pct * 100)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          {result.aiExplanation && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold text-white">
                AI Explanation
              </h3>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {result.aiExplanation}
              </div>
            </div>
          )}

          {/* Approve */}
          <button
            onClick={() => approve.mutate({ recommendationId: result.id })}
            disabled={approve.isPending}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {approve.isPending ? "Approving..." : "Approve & Execute"}
          </button>
        </div>
      )}

      {/* History */}
      {history.data && history.data.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-white">
            Recent Recommendations
          </h3>
          <div className="mt-3 space-y-2">
            {history.data.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">
                    {formatUsd(rec.totalAmountUsd)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    rec.status === "approved"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : rec.status === "pending"
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
