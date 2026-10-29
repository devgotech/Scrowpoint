/**
 * Scrowpoint Centralized Typed API Client
 * Connects the Next.js frontend to the Go Core Backend (/api/*)
 * with automatic Bearer token injection and graceful offline/preview fallback.
 */

export interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data?: T;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("sp_auth_token") ||
    localStorage.getItem("sp_access_token") ||
    localStorage.getItem("bh_access_token") ||
    null
  );
}

export function setAuthSession(token: string, user?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sp_auth_token", token);
  localStorage.setItem("sp_access_token", token);
  localStorage.setItem("bh_access_token", token);
  if (user) {
    localStorage.setItem("sp_user", JSON.stringify(user));
    localStorage.setItem("sp_auth_user", JSON.stringify(user));
  }

  // Synchronize session cookie for Next.js middleware route protection
  const isSecure = window.location.protocol === "https:";
  document.cookie = `sp_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  document.cookie = `sp_session=active; path=/; max-age=604800; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sp_auth_token");
  localStorage.removeItem("sp_access_token");
  localStorage.removeItem("bh_access_token");
  localStorage.removeItem("sp_user");
  localStorage.removeItem("sp_auth_user");

  // Invalidate session cookies
  document.cookie = "sp_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "sp_session=; path=/; max-age=0; SameSite=Lax";
}

/**
 * Core HTTP wrapper that attaches JWT Authorization header, parses JSON envelopes,
 * and returns `{ ok, data, error, status }` without throwing on network unreachable
 * so preview environments can seamlessly fall back.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(normalizedPath, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `Unexpected content-type: ${contentType || "none"}`,
      };
    }

    const payload = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: payload?.error || payload?.message || `HTTP ${res.status}`,
      };
    }

    const unwrapped =
      payload && typeof payload === "object" && "data" in payload
        ? (payload.data as T)
        : (payload as T);

    return {
      ok: true,
      status: res.status,
      data: unwrapped,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err instanceof Error ? err.message : "Network unreachable",
    };
  }
}

// ============================================================================
// 1. AUTHENTICATION & USER PROFILE API
// ============================================================================
export interface AuthUserDTO {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  full_name?: string;
  role: string;
  kycStatus?: string;
  kyc_tier?: string;
  emailVerifiedAt?: string | null;
  email_verified?: boolean;
}

export interface AuthResponseDTO {
  access_token?: string;
  token?: string;
  user?: AuthUserDTO;
  verification_code_preview?: string;
}

export const authApi = {
  login: (payload: { email: string; password?: string }) =>
    apiFetch<AuthResponseDTO>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  signup: (payload: {
    email: string;
    phone: string;
    password?: string;
    full_name: string;
    role: string;
  }) =>
    apiFetch<AuthResponseDTO>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  oauth: (
    provider: "google" | "facebook",
    payload: { email: string; name: string; providerUid: string }
  ) =>
    apiFetch<AuthResponseDTO>(`/api/auth/oauth/${provider}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmail: (payload: { token: string }) =>
    apiFetch<{ message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendVerification: () =>
    apiFetch<{ message: string; token: string }>("/api/auth/resend-verification", {
      method: "POST",
    }),

  requestPasswordReset: (payload: { email: string }) =>
    apiFetch<{ message: string }>("/api/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    apiFetch<{ reset: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => apiFetch<AuthUserDTO>("/api/users/me"),

  updateProfile: (payload: { full_name?: string; phone?: string; avatar_url?: string }) =>
    apiFetch<AuthUserDTO>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// ============================================================================
// 2. KYC & SMILE ID BIOMETRIC VERIFICATION API
// ============================================================================
export interface KYCStatusDTO {
  user_id?: string;
  kyc_tier: string;
  status: string;
  id_type?: string;
  masked_id?: string;
  verified_at?: string;
}

export const kycApi = {
  getStatus: () => apiFetch<KYCStatusDTO>("/api/kyc/status"),

  submit: (payload: {
    id_type: "BVN" | "NIN";
    id_number: string;
    first_name: string;
    last_name: string;
    dob?: string;
    selfie_url?: string;
  }) =>
    apiFetch<KYCStatusDTO>("/api/kyc/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ============================================================================
// 3. MARKETPLACE LISTINGS & IMEI DIAGNOSTICS API
// ============================================================================
export interface BackendListingDTO {
  id: string;
  seller_id: string;
  seller_name?: string;
  title: string;
  category: string;
  condition_grade: string;
  price_kobo: number;
  imei_or_serial?: string;
  imei_verified?: boolean;
  battery_health?: number;
  storage_capacity?: string;
  color?: string;
  location_city?: string;
  location_state?: string;
  description?: string;
  image_urls?: string[];
  status?: string;
  created_at?: string;
}

export const listingsApi = {
  list: (params?: {
    category?: string;
    condition?: string;
    search?: string;
    role?: "seller" | "buyer";
  }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== "all") qs.set("category", params.category);
    if (params?.condition && params.condition !== "all") qs.set("condition", params.condition);
    if (params?.search) qs.set("search", params.search);
    if (params?.role) qs.set("role", params.role);
    const query = qs.toString();
    return apiFetch<BackendListingDTO[]>(`/api/listings${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => apiFetch<BackendListingDTO>(`/api/listings/${encodeURIComponent(id)}`),

  create: (payload: {
    title: string;
    category: string;
    condition_grade: string;
    price_kobo: number;
    imei_or_serial: string;
    battery_health?: number;
    storage_capacity?: string;
    color?: string;
    location_city: string;
    location_state: string;
    description: string;
    image_urls: string[];
  }) =>
    apiFetch<BackendListingDTO>("/api/listings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyImei: (payload: { imei_or_serial: string; category?: string; brand?: string }) =>
    apiFetch<{
      valid: boolean;
      luhn_passed: boolean;
      blacklist_status: string;
      icloud_lock_status: string;
      tac_prefix: string;
      detected_hardware: string;
      duplicate_active: boolean;
      verification_badge: string;
      checked_at: string;
    }>("/api/listings/verify-imei", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ============================================================================
// 4. ORDERS & ESCROW VAULT STATE MACHINE API
// ============================================================================
export interface BackendOrderDTO {
  id: string;
  listing_id: string;
  listing_title?: string;
  buyer_id: string;
  seller_id: string;
  amount_kobo: number;
  escrow_fee_kobo: number;
  logistics_fee_kobo?: number;
  total_kobo: number;
  status: string;
  courier_name?: string;
  tracking_number?: string;
  delivery_otp?: string;
  shipping_address?: string;
  inspection_expires_at?: string;
  created_at?: string;
}

export interface EscrowLedgerEntryDTO {
  id: string;
  order_id: string;
  entry_type: string;
  debit_account: string;
  credit_account: string;
  amount_kobo: number;
  reference: string;
  created_at: string;
}

export const ordersApi = {
  create: (payload: {
    listing_id: string;
    shipping_address: string;
    logistics_provider?: string;
    logistics_fee_kobo?: number;
  }) =>
    apiFetch<BackendOrderDTO>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: (role?: "buyer" | "seller") =>
    apiFetch<BackendOrderDTO[]>(`/api/orders${role ? `?role=${role}` : ""}`),

  getById: (id: string) => apiFetch<BackendOrderDTO>(`/api/orders/${encodeURIComponent(id)}`),

  ship: (id: string, payload: { courier_name: string; tracking_number: string; waybill_photo_url?: string }) =>
    apiFetch<BackendOrderDTO>(`/api/orders/${encodeURIComponent(id)}/ship`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deliver: (id: string) =>
    apiFetch<BackendOrderDTO>(`/api/orders/${encodeURIComponent(id)}/deliver`, {
      method: "POST",
    }),

  confirmRelease: (id: string, payload?: { delivery_otp?: string }) =>
    apiFetch<BackendOrderDTO>(`/api/orders/${encodeURIComponent(id)}/confirm`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  cancel: (id: string, reason?: string) =>
    apiFetch<BackendOrderDTO>(`/api/orders/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || "Buyer requested cancellation" }),
    }),

  submitReturnShipment: (
    id: string,
    payload: { courier_name: string; tracking_number: string; notes?: string }
  ) =>
    apiFetch<BackendOrderDTO>(`/api/orders/${encodeURIComponent(id)}/return-shipment`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  fundEscrow: (payload: { order_id: string; payment_reference: string; amount_kobo: number }) =>
    apiFetch<{ status: string; order_id: string; reference: string }>("/api/escrow/fund", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getEscrowStatus: (orderId: string) =>
    apiFetch<{ order_id: string; status: string; locked_kobo: number; ledger_balanced: boolean }>(
      `/api/escrow/${encodeURIComponent(orderId)}/status`
    ),

  getEscrowLedger: (orderId: string) =>
    apiFetch<EscrowLedgerEntryDTO[]>(`/api/escrow/${encodeURIComponent(orderId)}/ledger`),
};

// ============================================================================
// 5. PAYMENTS, PAYSTACK & SELLER WALLET API
// ============================================================================
export interface SellerEarningsSummaryDTO {
  available_balance_kobo: number;
  locked_in_escrow_kobo: number;
  total_withdrawn_kobo: number;
  completed_trades_count: number;
}

export const paymentsApi = {
  initializePaystack: (payload: {
    order_id: string;
    email: string;
    amount_kobo: number;
    callback_url?: string;
  }) =>
    apiFetch<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>("/api/payments/paystack/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resolveBankAccount: (payload: { bank_code: string; account_number: string }) =>
    apiFetch<{
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
      verified: boolean;
    }>("/api/payments/paystack/resolve-account", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getEarningsSummary: () => apiFetch<SellerEarningsSummaryDTO>("/api/seller/earnings-summary"),

  requestPayout: (payload: {
    amount_kobo: number;
    bank_code: string;
    account_number: string;
    account_name: string;
  }) =>
    apiFetch<{
      id: string;
      amount_kobo: number;
      status: string;
      reference: string;
      created_at: string;
    }>("/api/payouts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ============================================================================
// 6. DISPUTES & ARBITRATION EVIDENCE API
// ============================================================================
export interface BackendDisputeDTO {
  id: string;
  order_id: string;
  initiator_id: string;
  reason: string;
  description: string;
  status: string;
  evidence_urls?: string[];
  resolution_verdict?: string;
  seller_split_pct?: number;
  created_at?: string;
}

export const disputesApi = {
  create: (payload: {
    order_id: string;
    reason: string;
    description: string;
    evidence_urls: string[];
  }) =>
    apiFetch<BackendDisputeDTO>("/api/disputes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getById: (id: string) => apiFetch<BackendDisputeDTO>(`/api/disputes/${encodeURIComponent(id)}`),

  addEvidence: (
    id: string,
    payload: { file_url: string; file_type: string; caption?: string; sha256_hash?: string }
  ) =>
    apiFetch<{ added: boolean; dispute_id: string }>(
      `/api/disputes/${encodeURIComponent(id)}/evidence`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};

// ============================================================================
// 7. ADMIN COMMAND CENTER API
// ============================================================================
export interface AdminSummaryDTO {
  total_escrow_locked_kobo: number;
  active_orders_count: number;
  open_disputes_count: number;
  pending_kyc_count: number;
  pending_payouts_count: number;
  platform_revenue_kobo: number;
}

export const adminApi = {
  getSummary: () => apiFetch<AdminSummaryDTO>("/api/admin/summary"),

  listDisputes: () => apiFetch<BackendDisputeDTO[]>("/api/admin/disputes"),

  resolveDispute: (
    disputeId: string,
    payload: {
      verdict: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER" | "SPLIT_SETTLEMENT";
      seller_split_pct?: number;
      admin_notes: string;
    }
  ) =>
    apiFetch<{ resolved: boolean; dispute_id: string; verdict: string }>(
      `/api/admin/disputes/${encodeURIComponent(disputeId)}/resolve`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  listPendingKYC: () =>
    apiFetch<
      Array<{
        id: string;
        user_id: string;
        full_name: string;
        id_type: string;
        masked_id: string;
        status: string;
        submitted_at: string;
      }>
    >("/api/admin/kyc/pending"),

  reviewKYC: (kycId: string, payload: { decision: "APPROVE" | "REJECT"; reason?: string }) =>
    apiFetch<{ kyc_id: string; decision: string }>(
      `/api/admin/kyc/${encodeURIComponent(kycId)}/review`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  listPayouts: () =>
    apiFetch<
      Array<{
        id: string;
        seller_id: string;
        amount_kobo: number;
        bank_name: string;
        account_number: string;
        status: string;
        created_at: string;
      }>
    >("/api/admin/payouts"),

  reviewPayout: (
    payoutId: string,
    payload: { action: "APPROVE" | "HOLD" | "REJECT"; notes?: string }
  ) =>
    apiFetch<{ payout_id: string; status: string }>(
      `/api/admin/payouts/${encodeURIComponent(payoutId)}/review`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  listUsers: () =>
    apiFetch<
      Array<{
        id: string;
        email: string;
        full_name: string;
        role: string;
        kyc_tier: string;
        status: string;
      }>
    >("/api/admin/users"),

  updateUserStatus: (userId: string, payload: { status: "ACTIVE" | "SUSPENDED" | "FROZEN"; reason?: string }) =>
    apiFetch<{ user_id: string; status: string }>(
      `/api/admin/users/${encodeURIComponent(userId)}/status`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};
