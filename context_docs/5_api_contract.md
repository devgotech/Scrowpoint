# 5_api_contract.md: API Contract — Scrowpoint

Conventions:
- All responses: `{ data: T, error: string | null }`
- Timestamps ISO 8601
- Bearer JWT Authorization
- Escrow ledger is strictly append-only

Endpoints:
- `/api/config`: Marketplace categories, grading conditions, platformFeePct
- `/api/auth/*`: signup, login, oauth, logout, me, verify-email, reset-password, change-password, sessions
- `/api/users/*`: profile, avatar, public-profile
- `/api/kyc/*`: submit (SmileID ref), status, history
- `/api/listings/*`: search, draft, publish, detail, update, delist, save
- `/api/orders/*`: quote (tiered 5%/2.5%/1.5%), create, list, detail, tracking, confirm-receipt, receipt
- `/api/escrow/*`: fund, status, ledger (append-only)
- `/api/payments/*`: paystack/initialize, paystack/webhook, payment-methods, payouts
- `/api/disputes/*`: open, evidence, submit, respond, return-label, return-shipped, confirm-return, sub-case, appeal
- `/api/admin/*`: disputes, assign, evidence, verdict, appeals, reports, users/suspend, summary
- `/api/notifications/*`: list, mark-all-read, mark-as-read
