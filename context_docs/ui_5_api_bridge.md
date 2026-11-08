# UI Context Spec 5: API Bridge & Data Fetching Strategy

## 1. Executive Purpose
This document defines how the Next.js 16 App Router frontend securely communicates with the core Go backend and the auxiliary Python media microservice. It establishes strict patterns for Server-Side Rendering (SSR) to maximize SEO for public listings, Client-Side data mutations for state-heavy escrow interactions, and secure JWT handling.

---

## 2. Next.js App Router Paradigms

### A. Server Components (Default)
*   **Target Use Case:** Public routes (`/marketplace`), SEO-critical pages, and initial data loads for secure dashboards.
*   **Fetching Strategy:** Use native `fetch()` within Server Components to hit the Go API. This ensures the client receives fully constructed HTML (e.g., displaying the `GadgetListingCard` masonry grid instantly without a loading skeleton).
*   **Cache Invalidation:** Use Next.js `revalidatePath` and `revalidateTag` when a seller creates a new listing, ensuring the public marketplace reflects the new inventory immediately without forcing heavy client-side re-fetches.

### B. Client Components (`"use client"`)
*   **Target Use Case:** Highly interactive Tier 2 & Tier 3 components (`EscrowTrackerStepper`, `ActionRequiredCard`, Form Submissions).
*   **Fetching Strategy:** Use Server Actions for mutations (e.g., "Approve Item") and a lightweight fetching library (like SWR or React Query) for real-time polling during critical states (e.g., polling the 48-hour inspection countdown or awaiting a Paystack webhook confirmation).

---

## 3. Authentication & Security (JWT Handling)

*   **Storage:** The Go backend will issue an HTTP-only, secure cookie containing the JWT. The Next.js frontend must never store JWTs in `localStorage` to prevent XSS attacks.
*   **Middleware Protection:** Next.js `middleware.ts` will intercept requests to `/dashboard`, `/escrow`, and `/admin`. If the HTTP-only auth cookie is missing or expired, it immediately redirects the user to `/login` before rendering the shell.
*   **Auth State in Client:** Create a React Context (`AuthContext`) that initializes from the server-validated cookie, providing the `user` object (ID, role, KYC tier) to deeply nested Client Components without prop-drilling.

---

## 4. Media Microservice Integration (Python)

*   **The Bottleneck Risk:** Uploading 50MB 4K videos of unboxing evidence directly through Next.js API routes will crash the Vercel/frontend server limit.
*   **The Solution (Presigned URLs):**
    1.  The Next.js frontend calls the Go backend: "I need to upload a 20MB video for Dispute #8921."
    2.  Go generates a temporary, secure AWS S3 Presigned URL and returns it to Next.js.
    3.  The frontend's `FileUploader` component uploads the file *directly* to the bucket using that URL.
    4.  Next.js notifies the Python microservice to begin processing (compression, metadata extraction, or tracking ID OCR) asynchronously.

---

## 5. API Response Standardization & Error Mapping

The Go backend responses must be mapped directly to the UI states defined in `ui_3_premium_states.md`.

*   **Standardized Go JSON Payload:**
    ```json
    {
      "status": "success" | "error",
      "data": { ... },
      "message": "User-friendly string",
      "code": "ERROR_ENUM"
    }
    ```
*   **Client-Side Toast Mapping:**
    *   If `status === "success"`, trigger a standard Shadcn toast: `toast({ title: "Success", description: response.message })`.
    *   If `status === "error"`, trigger a destructive toast: `toast({ variant: "destructive", title: "Action Failed", description: response.message })`.
*   **Form Validation Errors (400 Bad Request):** Field-level errors returned by Go must be caught by Next.js Server Actions and mapped to the `aria-invalid` state on the specific `<Input>` components.

---

## 6. Financial Formatting & Currency
*   All monetary values returned from the Go backend will be in base kobo/cents to avoid floating-point math errors.
*   The Next.js frontend must utilize a global utility function (`formatCurrency`) to convert the integer (e.g., `15000000`) into the display string (e.g., `₦150,000`) before passing it to the `font-mono` text components.