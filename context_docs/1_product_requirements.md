# 1_product_requirements.md: Escrow Product Requirements

## 1. Product Summary & Goal
Our application helps peer-to-peer gadget traders buy and sell safely using escrow protection to eliminate the risk of online scams. 

**MVP Success Metric:** The MVP is successful if 50 target users complete a gadget transaction from start to finish with zero reported fraud or lost funds within 30 days of launch.

## 2. Target Users & Permissions
*   **The Buyer:** Verifies identity, funds the escrow, inspects the device upon delivery, and accepts or disputes the item.
*   **The Seller:** Verifies identity, ships the device after funds are secured, and responds to disputes.
*   **The Admin:** Reviews dispute evidence, freezes funds during mediation, and executes final release or refund decisions.

## 3. Financial & Fee Model (P&L Rules)
*   **Platform Fee:** 2.5% standard (tiered 5%, 2.5%, 1.5%) charged to the Buyer at checkout.
*   **Payment Gateway Integration:** Paystack
*   **Gateway Fee Responsibility:** Absorbed by the platform from the fee margin.
*   **Seller Payout:** Sellers receive 100% of their listed asking price. Zero seller fees.
*   **Dispute Refund:** If mediated in favor of the buyer, the buyer receives a 100% refund of the gadget price, but the platform fee is non-refundable.

## 4. Escrow State Machine Definitions
Transactions strictly follow these state transitions:
1.  `CREATED`: Transaction initialized by buyer/seller.
2.  `PENDING_PAYMENT`: Payment gateway invoice generated.
3.  `FUNDS_HELD`: Money confirmed in escrow vault. Seller notified to ship.
4.  `IN_TRANSIT`: Seller provided tracking or initiated local handoff.
5.  `INSPECTION_PERIOD`: Item marked delivered. 48-hour countdown timer starts.
6.  `COMPLETED`: Buyer approved or inspection timer expired; funds released to seller payout wallet.
7.  `DISPUTED`: Inspection rejected; funds frozen until Admin decision.
8.  `RESOLVED_REFUNDED`: Admin refunded buyer.
9.  `RESOLVED_RELEASED`: Admin force-released funds to seller.

## 5. Inspection & Dispute Rules
*   **Inspection Window Duration:** 48 hours from delivery confirmation.
*   **Auto-Release Policy:** If no dispute is opened within 48 hours, background cron automatically transitions state from `INSPECTION_PERIOD` to `COMPLETED`.
*   **Dispute Trigger:** Buyers must upload at least 1 photo/video proof and select an issue type to transition to `DISPUTED`.
*   **Return Timeline:** If admin sides with buyer, buyer has 72 hours to ship item back.

## 6. External Verification Fallbacks
*   **Identity Verification Provider:** SmileID.
*   **Fallback Logic:** If the external API times out (503) or fails, the system sets verification status to `MANUAL_REVIEW_REQUIRED` and flags it for the Admin queue without blocking the user interface.
