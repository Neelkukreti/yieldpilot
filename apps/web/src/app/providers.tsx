"use client";

import { WalletProvider } from "@/components/wallet/wallet-provider";
import { TrpcProvider } from "@/lib/trpc/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <TrpcProvider>{children}</TrpcProvider>
    </WalletProvider>
  );
}
