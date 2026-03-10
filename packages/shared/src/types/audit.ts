export type AuditAction =
  | "policy_created"
  | "policy_updated"
  | "policy_deleted"
  | "recommendation_generated"
  | "recommendation_approved"
  | "recommendation_rejected"
  | "execution_started"
  | "execution_completed"
  | "execution_failed"
  | "alert_triggered"
  | "rebalance_proposed"
  | "rebalance_dismissed";

export interface AuditEntry {
  id: string;
  walletAddress: string;
  action: AuditAction;
  policyId?: string;
  recommendationId?: string;
  details: Record<string, unknown>;
  createdAt: Date;
}
