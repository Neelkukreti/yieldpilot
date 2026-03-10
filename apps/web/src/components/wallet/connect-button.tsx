"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function ConnectButton() {
  return <WalletMultiButton style={{ height: "40px", borderRadius: "8px" }} />;
}

export function useWalletAddress(): string | null {
  const { publicKey } = useWallet();
  return publicKey?.toBase58() ?? null;
}
