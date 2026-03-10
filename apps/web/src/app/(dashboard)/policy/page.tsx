"use client";

import { useState } from "react";
import { useWalletAddress } from "@/components/wallet/connect-button";
import { trpc } from "@/lib/trpc/client";
import { POLICY_PRESETS } from "@yieldpilot/shared";

const VENUES = ["kamino", "marinade"];

export default function PolicyPage() {
  const walletAddress = useWalletAddress();
  const utils = trpc.useUtils();

  const [preset, setPreset] = useState<string>("balanced");
  const [maxExposurePct, setMaxExposurePct] = useState(40);
  const [minLiquidityUsd, setMinLiquidityUsd] = useState(1_000_000);
  const [minApyPct, setMinApyPct] = useState(3);
  const [reserveRatioPct, setReserveRatioPct] = useState(10);
  const [whitelistedVenues, setWhitelistedVenues] = useState<string[]>([]);
  const [allowedAssets, setAllowedAssets] = useState<string[]>(["USDC", "USDT"]);

  const activePolicy = trpc.policy.getActive.useQuery(
    { walletAddress: walletAddress! },
    { enabled: !!walletAddress }
  );

  const createPolicy = trpc.policy.create.useMutation({
    onSuccess: () => {
      utils.policy.getActive.invalidate();
      utils.policy.list.invalidate();
    },
  });

  function applyPreset(name: string) {
    const p = POLICY_PRESETS[name as keyof typeof POLICY_PRESETS];
    if (!p) return;
    setPreset(name);
    // Presets use decimals (0.4 = 40%), convert to percentages for UI
    setMaxExposurePct(Math.round(p.maxExposurePct * 100));
    setMinLiquidityUsd(p.minLiquidityUsd);
    setMinApyPct(p.minApyPct);
    setReserveRatioPct(Math.round(p.reserveRatioPct * 100));
    setWhitelistedVenues([]);
  }

  function handleSubmit() {
    if (!walletAddress) return;
    createPolicy.mutate({
      walletAddress,
      name: `${preset.charAt(0).toUpperCase() + preset.slice(1)} Policy`,
      maxExposurePct,
      minLiquidityUsd,
      minApyPct,
      reserveRatioPct,
      whitelistedVenues,
      allowedAssets,
    });
  }

  if (!walletAddress) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Connect your wallet to configure policy
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Policy Configuration</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Define rules that govern how your treasury is allocated
        </p>
      </div>

      {activePolicy.data && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-400">
            Active Policy: {activePolicy.data.name}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Max {activePolicy.data.maxExposurePct}% exposure | Min $
            {(activePolicy.data.minLiquidityUsd / 1_000_000).toFixed(0)}M TVL |
            Min {activePolicy.data.minApyPct}% APY |{" "}
            {activePolicy.data.reserveRatioPct}% reserve
          </p>
        </div>
      )}

      {/* Presets */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-300">Quick Presets</label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(POLICY_PRESETS).map(([name, config]) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                preset === name
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
              }`}
            >
              <p className="text-sm font-medium capitalize text-white">{name}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {Math.round(config.maxExposurePct * 100)}% max | {Math.round(config.reserveRatioPct * 100)}% reserve
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <SliderField
          label="Max Exposure per Venue"
          value={maxExposurePct}
          onChange={setMaxExposurePct}
          min={10}
          max={80}
          suffix="%"
        />
        <SliderField
          label="Min Liquidity (TVL)"
          value={minLiquidityUsd}
          onChange={setMinLiquidityUsd}
          min={100_000}
          max={50_000_000}
          step={100_000}
          format={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
        />
        <SliderField
          label="Min APY"
          value={minApyPct}
          onChange={setMinApyPct}
          min={0}
          max={20}
          step={0.5}
          suffix="%"
        />
        <SliderField
          label="Reserve Ratio"
          value={reserveRatioPct}
          onChange={setReserveRatioPct}
          min={0}
          max={50}
          suffix="%"
        />

        <div>
          <label className="text-sm font-medium text-zinc-300">
            Whitelisted Venues
          </label>
          <p className="mb-2 text-xs text-zinc-500">
            Leave empty to allow all venues
          </p>
          <div className="flex gap-3">
            {VENUES.map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={whitelistedVenues.includes(v)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setWhitelistedVenues([...whitelistedVenues, v]);
                    } else {
                      setWhitelistedVenues(whitelistedVenues.filter((x) => x !== v));
                    }
                  }}
                  className="rounded border-zinc-600"
                />
                <span className="text-sm capitalize text-zinc-300">{v}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={createPolicy.isPending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {createPolicy.isPending ? "Saving..." : "Save Policy"}
        </button>

        {createPolicy.isSuccess && (
          <p className="text-center text-sm text-emerald-400">
            Policy saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  format?: (v: number) => string;
}) {
  const display = format ? format(value) : `${value}${suffix ?? ""}`;
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <span className="text-sm font-mono text-emerald-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-emerald-500"
      />
    </div>
  );
}
