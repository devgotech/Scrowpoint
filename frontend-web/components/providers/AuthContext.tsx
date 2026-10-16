"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Types and Enums matching Buyer's High Go Backend & Domain Models
 */
export type UserRole = "buyer" | "seller" | "admin";

export type KYCStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "manual_review_required";

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

export interface AuthContextValue {
  /** The authenticated user entity or null if guest */
  user: UserProfile | null;
  /** Primary identifier shorthand */
  userId: string | null;
  /** Role of the active user: "buyer" | "seller" | "admin" */
  role: UserRole | null;
  /** Active KYC verification status */
  kycTier: KYCStatus | null;
  /** True while the session is being initialized from the cookie or backend */
  isLoading: boolean;
  /** Convenience boolean for authentication state */
  isAuthenticated: boolean;
  /** Convenience boolean for admin capabilities */
  isAdmin: boolean;
  /** True if the user has been fully approved for high-trust escrow actions */
  isKYCVerified: boolean;
  /** Manually refresh the authenticated user's profile from the API */
  refreshUser: () => Promise<void>;
  /** Client-side state updater / setter */
  setUser: (user: UserProfile | null) => void;
  /** Clear auth state and notify the backend */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
  /** Optional initial user passed down from Server Component layout */
  initialUser?: UserProfile | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);

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
          setUser(null);
        }
        return;
      }

      const json = await res.json();
      if (json.data) {
        setUser(json.data as UserProfile);
      } else if (json.id) {
        setUser(json as UserProfile);
      }
    } catch {
      // In case of network drops or offline states, avoid crashing the app
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      fetchCurrentUser();
    }
  }, [initialUser, fetchCurrentUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

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
      logout,
    };
  }, [user, isLoading, fetchCurrentUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume the Buyer's High AuthContext.
 * Throws a helpful error if invoked outside of <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}

export default AuthContext;
