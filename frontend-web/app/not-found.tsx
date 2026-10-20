import Link from "next/link";
import { Home, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 404 Not Found Page for Buyer's High.
 *
 * Requirements (UI Context Spec 4, §9 & UI Context Spec 3, §4):
 * - Clean branded missing page.
 * - Informs the user that the gadget listing, escrow order, or route could not be found.
 * - Assures users that funds and account records remain safe in the vault.
 * - Provides immediate navigation recovery to Marketplace, Search, or Home.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg border-border bg-card shadow-lg text-center overflow-hidden rounded-2xl">
        <div className="h-2 w-full bg-primary" />
        
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">404</span>
          </div>

          <CardTitle className="font-heading text-2xl font-bold text-foreground">
            Page or Gadget Not Found
          </CardTitle>

          <p className="font-body text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            The gadget listing, escrow room, or destination you requested may have been sold,
            removed, or does not exist at this URL.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground font-body flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-trust-strong shrink-0" />
            <span>All active escrow funds and balances remain safe in the custodial vault.</span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pb-8 pt-2">
          <Link href="/marketplace" className="w-full sm:w-auto">
            <Button variant="default" size="default" className="w-full gap-2">
              <Search className="h-4 w-4" />
              <span>Browse Marketplace</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="default" className="w-full gap-2 border-border">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
