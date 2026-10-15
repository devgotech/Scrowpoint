# 2_domain_logic.md: Business Rules & Domain Logic

## 1. Device Grading Framework
All listings must conform to a standardized device grading condition:
*   **Mint (A-Grade):** Flawless physical condition, 95%+ battery health, original parts.
*   **Good (B-Grade):** Minor micro-scratches visible under direct light, 85-94% battery health, fully functional.
*   **Fair (C-Grade):** Visible scratches or minor dents, 75-84% battery health, fully functional.
*   **Salvage (D-Grade):** Cracked glass, defective modules, or battery below 75%.

## 2. Inventory SKU Architecture
Format: `CATEGORY-BRAND-MODEL-STORAGE-GRADE`
Example: `PHN-APL-IP14PM-256-MINT`

## 3. Financial P&L and Escrow Fee Model
*   **Platform Fee:** Tiered 5% (≤150K), 2.5% (150K-750K), 1.5% (>750K) added to Buyer's total at checkout.
*   **Payment Gateway Fee:** Absorbed by the platform from the platform fee.
*   **Seller Payout:** Sellers receive 100% of their listed asking price. Zero seller fees.
*   **Dispute Refund:** 100% refund of gadget price; platform fee is non-refundable.

## 4. KYC & Identity Verification SLA
*   Accounts require email verification and profile completion.
*   Transactions require ID Verification (Govt ID + Selfie via SmileID).
*   Verification SLA is configured to a "Review Pending" state lasting 24-48 hours.

## 5. Fulfillment & Inspection Rules
*   **Fulfillment Types:** `SHIPPING` or `LOCAL_HANDOFF`.
*   **Inspection Cycle:** 48-hour inspection period upon delivery confirmation.
*   **Auto-Release:** If 48h timer expires with no action, funds auto-release to Seller.
*   **Return Logistics:** If dispute favors buyer, return label generated with 72h return deadline. Seller payout remains locked until seller confirms return receipt.
