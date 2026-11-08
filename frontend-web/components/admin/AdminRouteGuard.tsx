"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { isAdmin, isMediator, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin || isMediator) return;
    if (isAuthenticated) {
      router.replace("/");
      return;
    }
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isAdmin, isMediator, isAuthenticated, pathname, router]);

  return isAdmin || isMediator ? children : null;
}