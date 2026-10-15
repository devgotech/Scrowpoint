import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container py-12 flex flex-col gap-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold">Phase 2: Atomic UI Verification</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Status Badges</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Badge variant="trust">FUNDS_HELD</Badge>
          <Badge variant="warning">DISPUTED</Badge>
          <Badge variant="secondary">DRAFT</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Form Inputs & Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-xs mb-1 block">Valid Input</label>
            <Input placeholder="Enter gadget model..." />
          </div>
          <div>
            <label className="font-mono text-xs mb-1 block text-destructive">Invalid Input</label>
            {/* Trigger the error state using aria-invalid */}
            <Input aria-invalid={true} placeholder="Missing SKU..." />
            <span className="text-xs text-destructive mt-1 block">This field is required.</span>
          </div>
          <Button className="w-fit mt-2">Proceed to Escrow</Button>
        </CardContent>
      </Card>
    </main>
  );
}