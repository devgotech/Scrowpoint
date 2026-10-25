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
 * Types and Enums matching Scrowpoint Go Backend & Domain Models
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
  login: (email?: string, name?: string, role?: UserRole) => void;
  /** Clear auth state */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
  /** Optional initial user passed down from Server Component layout */
  initialUser?: UserProfile | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sp_auth_user");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      if (json.data) {
        setUser(json.data as UserProfile);
      } else if (json.id) {
        setUser(json as UserProfile);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (email = "chidi.okafor@scrowpoint.com", name = "Chidi Okafor", role: UserRole = "seller") => {
      const newUser: UserProfile = {
        ...DEFAULT_DEMO_USER,
        id: `usr-${Date.now().toString(36)}`,
        email,
        name,
        role,
      };
      setUser(newUser);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sp_auth_user", JSON.stringify(newUser));
        } catch {}
      }
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
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("sp_auth_user");
        } catch {}
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
      setUser: (u) => {
        setUser(u);
        if (typeof window !== "undefined") {
          try {
            if (u) localStorage.setItem("sp_auth_user", JSON.stringify(u));
            else localStorage.removeItem("sp_auth_user");
          } catch {}
        }
      },
      login,
      logout,
    };
  }, [user, isLoading, fetchCurrentUser, login, logout]);

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
