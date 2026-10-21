import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 404 Not Found Page for Buyer's High.
 *
 * Requirements (4_ui_system.md & UI Context Spec 4, §9, UI Context Spec 3, §4):
 * - Corner Radius: --radius-card (8px -> rounded-[8px]). Controls: 4px.
 * - Assures users that funds and account records remain safe in the vault.
 * - Recovery links to Marketplace and Home.
 * - Strict duration-200 ease-out transitions.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg border-[#e2e8f0] bg-white shadow-[0_4px_8px_rgba(15,23,42,0.06)] text-center overflow-hidden rounded-[8px]">
        <div className="h-1.5 w-full bg-[#0f172a]" />
        
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[4px] bg-[#f1f5f9] text-[#64748b]">
            <span className="font-mono text-2xl font-bold tracking-tight text-[#020617]">404</span>
          </div>

          <CardTitle className="font-primary text-2xl font-medium text-[#020617]">
            Page or Gadget Not Found
          </CardTitle>

          <p className="font-secondary text-xs text-[#64748b] mt-2 max-w-sm mx-auto leading-relaxed">
            The gadget listing, escrow room, or destination you requested may have been sold,
            removed, or does not exist at this URL.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-[4px] border border-[#22c55e]/30 bg-[#22c55e]/15 p-3.5 text-xs text-[#15803d] font-secondary flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#22c55e] shrink-0" />
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
            <Button variant="outline" size="default" className="w-full gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
