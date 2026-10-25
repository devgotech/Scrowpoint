"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

/**
 * Root Error Boundary Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 3, §4, UI Context Spec 4, §9):
 * - Must be a Client Component ("use client").
 * - Graceful Degradation: Never exposes raw Go stack traces, database credentials, or panics.
 * - Displays a structured high-trust alert card with `rounded-[8px]` (--radius-card), border-[#f56565]/40 and AlertCircle.
 * - Primary "Try Again" recovery action via `reset()` with 4px button radius.
 * - Transitions: strict duration-200 ease-out.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error securely for client observability
    console.error("[Scrowpoint Client Exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-lg border-[#f56565]/40 bg-white rounded-[8px] shadow-[0_4px_8px_rgba(15,23,42,0.06)]">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f56565]/10 text-[#f56565]">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="font-primary text-xl font-medium text-[#020617]">
            We couldn't load this information
          </CardTitle>
          <CardDescription className="font-secondary text-sm text-[#64748b] mt-2 leading-relaxed">
            An unexpected error occurred while communicating with our secure services.
            Your escrow transactions and wallet balances remain protected.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="rounded-[4px] bg-[#f8fafc] p-4 text-xs font-mono text-[#64748b] border border-[#e2e8f0]">
            <div className="flex items-center justify-center gap-2 mb-1 text-[#020617] font-semibold">
              <ShieldAlert className="h-4 w-4 text-[#ecc94b]" />
              <span>Escrow State Safeguard Active</span>
            </div>
            <span>Reference ID: {error.digest || "ERR_SP_TRANSACTION_RETRY"}</span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            size="default"
            className="w-full sm:w-auto min-w-36 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>

          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            variant="outline"
            size="default"
            className="w-full sm:w-auto min-w-36 gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Go to Marketplace</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
