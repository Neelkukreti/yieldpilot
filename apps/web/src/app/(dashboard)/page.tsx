"use client";

import { useWalletAddress } from "@/components/wallet/connect-button";
import { TrendingUp, Shield, DollarSign, Activity } from "lucide-react";

export default function DashboardPage() {
  const walletAddress = useWalletAddress();

  if (!walletAddress) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            Welcome to YieldPilot
          </h2>
          <p className="mt-2 text-zinc-400">
            Connect your wallet to manage your stablecoin treasury
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Your stablecoin treasury at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Balance"
          value="$0.00"
          icon={DollarSign}
          change=""
        />
        <KpiCard
          title="Projected Yield"
          value="0.0%"
          icon={TrendingUp}
          change=""
        />
        <KpiCard
          title="Policy Status"
          value="No Policy"
          icon={Shield}
          change=""
        />
        <KpiCard
          title="Active Positions"
          value="0"
          icon={Activity}
          change=""
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h3 className="text-lg font-semibold text-white">Getting Started</h3>
        <ol className="mt-4 space-y-3 text-sm text-zinc-400">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
              1
            </span>
            Set up a policy to define your risk preferences and constraints
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
              2
            </span>
            Browse available yield strategies across DeFi venues
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
              3
            </span>
            Generate an AI-powered allocation recommendation
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
              4
            </span>
            Review, approve, and execute on-chain
          </li>
        </ol>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  change,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <Icon className="h-4 w-4 text-zinc-600" />
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {change && (
        <p className="mt-1 text-xs text-emerald-400">{change}</p>
      )}
    </div>
  );
}
