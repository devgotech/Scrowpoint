"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { authApi, clearAuthSession, setAuthSession } from "@/lib/api";

/**
 * Types and Enums matching Scrowpoint Go Backend & Domain Models
 */
export type UserRole = "buyer" | "seller" | "admin";
export type OAuthProviderType = "google" | "facebook";

export type KYCStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "manual_review_required";

function isKYCStatus(value: string | undefined): value is KYCStatus {
  return (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "manual_review_required"
  );
}

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  kycStatus: KYCStatus;
  ratingAvg?: number;
  ratingCount?: number;
  isSuspended?: boolean;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_DEMO_USER: UserProfile = {
  id: "usr-trader-01",
  name: "Chidi Okafor",
  email: "chidi.okafor@scrowpoint.com",
  role: "seller",
  phone: "+234 803 456 7890",
  location: "Ikeja, Lagos",
  kycStatus: "approved",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
};

export interface AuthContextValue {
  /** The authenticated user entity or null if guest */
  user: UserProfile | null;
  /** Primary identifier shorthand */
  userId: string | null;
  /** Role of the active user: "buyer" | "seller" | "admin" */
  role: UserRole | null;
  /** Active KYC verification status */
  kycTier: KYCStatus | null;
  /** True while the session is being initialized */
  isLoading: boolean;
  /** Convenience boolean for authentication state */
  isAuthenticated: boolean;
  /** Convenience boolean for admin capabilities */
  isAdmin: boolean;
  /** True if the user has been fully approved for high-trust escrow actions */
  isKYCVerified: boolean;
  /** Manually refresh the authenticated user's profile */
  refreshUser: () => Promise<void>;
  /** Client-side state updater / setter */
  setUser: (user: UserProfile | null) => void;
  /** Login helper */
  login: (
    email?: string,
    name?: string,
    role?: UserRole,
    profile?: Partial<Omit<UserProfile, "id" | "email" | "name" | "role">>
  ) => void;
  oauthLogin: (
    provider: OAuthProviderType,
    profile: {
      email: string;
      name: string;
      providerUid: string;
      role?: UserRole;
      avatarUrl?: string;
    }
  ) => Promise<UserProfile>;
  verifyEmailToken: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  /** Clear auth state */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_STORAGE_KEY = "sp_auth_user";

function subscribeToAuthStorage(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener("scrowpoint-auth-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("scrowpoint-auth-change", onChange);
  };
}

function getAuthStorageSnapshot() {
  return typeof window === "undefined"
    ? null
    : window.localStorage.getItem(AUTH_STORAGE_KEY);
}

function getAuthStorageServerSnapshot() {
  return null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  /** Optional initial user passed down from Server Component layout */
  initialUser?: UserProfile | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const savedUserJson = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthStorageSnapshot,
    getAuthStorageServerSnapshot
  );
  const [userOverride, setUserOverride] = useState<UserProfile | null | undefined>(
    undefined
  );
  const savedUser = useMemo(() => {
    if (!savedUserJson) return null;
    try {
      const parsed: unknown = JSON.parse(savedUserJson);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "id" in parsed &&
        "email" in parsed &&
        "name" in parsed &&
        "role" in parsed &&
        "kycStatus" in parsed
      ) {
        return parsed as UserProfile;
      }
      console.error("The saved authentication session has an invalid shape.");
    } catch (error) {
      console.error("Unable to restore the saved authentication session.", error);
    }
    return null;
  }, [savedUserJson]);
  const user = initialUser ?? (userOverride !== undefined ? userOverride : savedUser);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setUser = useCallback((nextUser: UserProfile | null) => {
    setUserOverride(nextUser);
    if (typeof window === "undefined") return;
    if (nextUser) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    window.dispatchEvent(new Event("scrowpoint-auth-change"));
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users/me", {
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // If no server session and no localStorage user, reset
          if (typeof window !== "undefined" && !localStorage.getItem("sp_auth_user")) {
            setUser(null);
          }
        }
        return;
      }

      const json = await res.json();
      const currentUser = json.data ?? json;
      if (currentUser?.id && currentUser?.email && currentUser?.role) {
        setUser({
          ...currentUser,
          name: currentUser.name ?? currentUser.full_name ?? currentUser.email,
          kycStatus: currentUser.kycStatus ?? currentUser.kyc_tier ?? "pending",
        } as UserProfile);
      }
    } catch (error) {
      console.error("Unable to refresh the authenticated user.", error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const login = useCallback(
    (
      email = "chidi.okafor@scrowpoint.com",
      name = "Chidi Okafor",
      role: UserRole = "seller",
      profile: Partial<Omit<UserProfile, "id" | "email" | "name" | "role">> = {}
    ) => {
      const newUser: UserProfile = {
        ...DEFAULT_DEMO_USER,
        ...profile,
        id: `usr-${Date.now().toString(36)}`,
        email,
        name,
        role,
      };
      setUser(newUser);
    },
    [setUser]
  );

  const oauthLogin = useCallback(
    async (
      provider: OAuthProviderType,
      profile: {
        email: string;
        name: string;
        providerUid: string;
        role?: UserRole;
        avatarUrl?: string;
      }
    ) => {
      const result = await authApi.oauth(provider, profile);
      if (!result.ok || !result.data?.user) {
        throw new Error(result.error || "Unable to complete sign-in.");
      }

      const { user: responseUser, token } = result.data;
      const authenticatedUser: UserProfile = {
        id: responseUser.id,
        email: responseUser.email,
        name: responseUser.name ?? responseUser.full_name ?? profile.name,
        role: responseUser.role === "seller" || responseUser.role === "admin"
          ? responseUser.role
          : "buyer",
        phone: responseUser.phone,
        avatarUrl: profile.avatarUrl,
        kycStatus: isKYCStatus(responseUser.kycStatus)
          ? responseUser.kycStatus
          : isKYCStatus(responseUser.kyc_tier)
            ? responseUser.kyc_tier
            : "pending",
        emailVerifiedAt:
          responseUser.emailVerifiedAt ??
          (responseUser.email_verified ? new Date().toISOString() : null),
      };

      if (token) setAuthSession(token, { ...responseUser });
      setUser(authenticatedUser);
      return authenticatedUser;
    },
    [setUser]
  );

  const verifyEmailToken = useCallback(async (token: string) => {
    const result = await authApi.verifyEmail({ token });
    if (!result.ok) throw new Error(result.error || "Email verification failed.");
    if (user) {
      setUser({ ...user, emailVerifiedAt: new Date().toISOString() });
    }
  }, [setUser, user]);

  const resendVerificationEmail = useCallback(async () => {
    const result = await authApi.resendVerification();
    if (!result.ok) throw new Error(result.error || "Unable to resend verification.");
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const result = await authApi.requestPasswordReset({ email });
    if (!result.ok) throw new Error(result.error || "Unable to request a password reset.");
  }, []);

  const resetPasswordWithToken = useCallback(
    async (token: string, newPassword: string) => {
      const result = await authApi.resetPassword({ token, newPassword });
      if (!result.ok) throw new Error(result.error || "Unable to reset the password.");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors
    } finally {
      setUser(null);
      clearAuthSession();
    }
  }, [setUser]);

  const value = useMemo<AuthContextValue>(() => {
    const userId = user?.id ?? null;
    const role = user?.role ?? null;
    const kycTier = user?.kycStatus ?? null;
    const isAuthenticated = Boolean(user && user.id);
    const isAdmin = role === "admin";
    const isKYCVerified = kycTier === "approved";

    return {
      user,
      userId,
      role,
      kycTier,
      isLoading,
      isAuthenticated,
      isAdmin,
      isKYCVerified,
      refreshUser: fetchCurrentUser,
      setUser,
      login,
      oauthLogin,
      verifyEmailToken,
      resendVerificationEmail,
      requestPasswordReset,
      resetPasswordWithToken,
      logout,
    };
  }, [
    user,
    isLoading,
    fetchCurrentUser,
    login,
    oauthLogin,
    verifyEmailToken,
    resendVerificationEmail,
    requestPasswordReset,
    resetPasswordWithToken,
    setUser,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}

export default AuthContext;
