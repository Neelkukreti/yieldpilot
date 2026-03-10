"use client";

import { useWalletAddress } from "@/components/wallet/connect-button";
import { trpc } from "@/lib/trpc/client";

const ACTION_LABELS: Record<string, string> = {
  policy_created: "Policy Created",
  policy_updated: "Policy Updated",
  recommendation_generated: "Recommendation Generated",
  recommendation_approved: "Recommendation Approved",
  recommendation_rejected: "Recommendation Rejected",
  execution_started: "Execution Started",
  execution_completed: "Execution Completed",
};

export default function AuditPage() {
  const walletAddress = useWalletAddress();

  const auditLog = trpc.audit.list.useQuery(
    { walletAddress: walletAddress!, limit: 50 },
    { enabled: !!walletAddress }
  );

  if (!walletAddress) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Connect your wallet to view audit log
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Log</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Complete record of all treasury decisions and actions
        </p>
      </div>

      {auditLog.isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg border border-zinc-800 bg-zinc-950"
            />
          ))}
        </div>
      )}

      {auditLog.data && auditLog.data.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
          No audit entries yet. Actions will appear here as you use YieldPilot.
        </div>
      )}

      {auditLog.data && auditLog.data.length > 0 && (
        <div className="space-y-2">
          {auditLog.data.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {entry.policy?.name && `Policy: ${entry.policy.name}`}
                    {entry.recommendation?.status &&
                      ` | Rec: ${entry.recommendation.status}`}
                  </p>
                </div>
              </div>
              <time className="text-xs text-zinc-500">
                {new Date(entry.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
