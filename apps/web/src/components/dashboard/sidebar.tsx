"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  TrendingUp,
  Sparkles,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/policy", label: "Policy", icon: Shield },
  { href: "/strategies", label: "Strategies", icon: TrendingUp },
  { href: "/recommend", label: "Optimize", icon: Sparkles },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-6">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-white">
          Yield<span className="text-emerald-400">Pilot</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-500">AI Treasury Copilot</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 pt-4">
        <div className="rounded-lg bg-zinc-900 px-3 py-2">
          <p className="text-xs text-zinc-500">Network</p>
          <p className="text-sm font-medium text-emerald-400">Solana Devnet</p>
        </div>
      </div>
    </aside>
  );
}
