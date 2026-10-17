export type AdminDisputeStatus =
  | "open"
  | "evidence_collection"
  | "seller_review"
  | "admin_mediation"
  | "resolved"
  | "appealed";

export interface AdminDisputeData {
  id: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail?: string;
  sellerName: string;
  sellerEmail?: string;
  gadgetTitle: string;
  reason: string;
  /** Locked funds in base kobo (e.g. 35000000 = ₦350,000) */
  lockedAmountKobo: number;
  status: AdminDisputeStatus;
  evidenceCount: number;
  slaRemainingString: string;
  isUrgentSla?: boolean;
  createdAt: string;
}
