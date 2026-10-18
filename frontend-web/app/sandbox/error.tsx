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
 * Root Error Boundary Component for Buyer's High.
 *
 * Requirements (UI Context Spec 3, §4 & UI Context Spec 4, §9):
 * - Must be a Client Component ("use client").
 * - Graceful Degradation: Never exposes raw Go stack traces, database credentials, or panics.
 * - Displays a structured high-trust alert card with `border-destructive/50` and `AlertCircle`.
 * - Includes a high-visibility primary "Try Again" recovery action via `reset()`.
 * - Provides a secondary fallback link to navigate back to the safe marketplace root.
 * - Adheres strictly to the 4-point spacing scale (p-6, gap-4, etc.) and semantic color tokens.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error securely for telemetry or client observability
    console.error("[Buyer's High Client Exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-lg border-destructive/50 bg-card shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="font-heading text-xl text-foreground">
            We couldn't load this information
          </CardTitle>
          <CardDescription className="font-body text-sm text-muted-foreground mt-2">
            An unexpected error occurred while communicating with our secure services.
            Your escrow transactions and wallet balances remain protected.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="rounded-lg bg-muted/60 p-4 text-xs font-mono text-muted-foreground border border-border">
            <div className="flex items-center justify-center gap-2 mb-1 text-foreground font-semibold">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <span>Escrow State Safeguard Active</span>
            </div>
            <span>Reference ID: {error.digest || "ERR_BH_TRANSACTION_RETRY"}</span>
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
