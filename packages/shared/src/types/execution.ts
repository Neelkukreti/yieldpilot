export interface TransactionPlan {
  id: string;
  recommendationId: string;
  actions: TransactionAction[];
  estimatedFeeSOL: number;
  estimatedTimeMs: number;
}

export interface TransactionAction {
  type: "deposit" | "withdraw" | "transfer";
  venue: string;
  vaultAddress: string;
  tokenMint: string;
  tokenSymbol: string;
  amountUsd: number;
  amountTokens: number;
  description: string;
}

export interface ExecutionResult {
  success: boolean;
  txSignatures: string[];
  actions: ExecutedAction[];
  error?: string;
}

export interface ExecutedAction {
  action: TransactionAction;
  txSignature?: string;
  status: "confirmed" | "failed" | "skipped";
  error?: string;
}
