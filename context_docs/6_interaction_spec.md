# 6_interaction_spec.md: Interaction Spec Document

Flows:
1. Public / Pre-Auth: Landing page, browse listings, view gadget details.
2. Onboarding & KYC: Sign up, profile completion, SmileID ID verification with 24-48h SLA and 503 fallback.
3. Buyer Journey: Escrow terms review, tiered fee quote, checkout, Paystack funding, 48h inspection period, approval/dispute.
4. Seller Journey: Draft listing, photo upload, SKU generation, dispatch tracking, 100% asking price payout.
5. Dispute Resolution: Evidence upload, seller rebuttal, 72h return window, damaged return sub-case (`parent_dispute_id`), arbitration ruling.
6. Admin Mediation: Dispute review, side-by-side evidence, rulings writing to append-only ledger, abuse queue, suspensions.
