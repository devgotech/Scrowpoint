"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";

const noopSubscribe = () => () => {};

/**
 * True only after hydration. The saved session lives in localStorage, which the
 * server render cannot read, so the first (hydration) pass always looks signed
 * out. Redirecting on that pass sent staff back to /login on every page reload.
 */
function useHasHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { isAdmin, isMediator, isAuthenticated } = useAuth();
  const hydrated = useHasHydrated();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || isAdmin || isMediator) return;
    if (isAuthenticated) {
      router.replace("/");
      return;
    }
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [hydrated, isAdmin, isMediator, isAuthenticated, pathname, router]);

  return hydrated && (isAdmin || isMediator) ? children : null;
}
