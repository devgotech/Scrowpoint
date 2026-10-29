"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import {
  PaymentMethodSelector,
  type PaymentMethodId,
} from "@/components/PaymentMethodSelector";
import {
  OrderSummaryCard,
  type EscrowOrderData,
} from "@/components/escrow/OrderSummaryCard";
import { SecureCheckoutButton } from "@/components/escrow/SecureCheckoutButton";
import { ordersApi, paymentsApi } from "@/lib/api";
import { INITIAL_GADGETS } from "../../../(public)/marketplace/page";
import { listingsApi } from "@/lib/api";
import type { GadgetListingData } from "@/components/GadgetListingCard";
import { useAuth } from "@/components/providers/AuthContext";

/**
 * Screen: Escrow Payment & Checkout (Phase 2 §2)
 * Route: app/(protected)/checkout/[order_id]/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - Sharp 0px architectural cards (border-[#111113]/12) paired with 999px pill primary CTAs
 */

export interface CheckoutPageProps {
  orderId?: string;
  onPaymentSuccess?: (orderId: string) => void;
  onBackToGadget?: () => void;
}

export default function CheckoutPage({
  orderId: providedOrderId,
  onPaymentSuccess,
  onBackToGadget,
}: CheckoutPageProps) {
  const routeParams = useParams<{ order_id?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = providedOrderId ?? routeParams.order_id ?? "SP-ORD-9421";
  const requestedGadgetId = searchParams.get("gadget") ?? "g-001";
  const fallbackGadget = INITIAL_GADGETS.find((item) => item.id === requestedGadgetId);
  const [liveGadget, setLiveGadget] = useState<GadgetListingData | null>(null);
  const [failedListingId, setFailedListingId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const gadget = fallbackGadget ?? (liveGadget?.id === requestedGadgetId ? liveGadget : null);
  const isListingLoading = !gadget && failedListingId !== requestedGadgetId;
  const resolvedGadget = gadget ?? INITIAL_GADGETS[0];
  const amountKobo = resolvedGadget.price;
  const escrowFeeKobo = Math.round((amountKobo * 250) / 10000);
  const logisticsFeeKobo = 450000;
  const totalDepositKobo = amountKobo + escrowFeeKobo + logisticsFeeKobo;

  useEffect(() => {
    if (fallbackGadget) return;
    let active = true;
    const lookupTimeout = window.setTimeout(() => {
      if (active) setFailedListingId(requestedGadgetId);
    }, 8000);
    listingsApi.getById(requestedGadgetId).then((result) => {
      if (!active) return;
      window.clearTimeout(lookupTimeout);
      if (!result.ok || !result.data) {
        setFailedListingId(requestedGadgetId);
        return;
      }

      const listing = result.data;
      const rawCondition = (listing.condition_grade || "mint").toLowerCase();
      const condition =
        rawCondition === "good" || rawCondition === "fair" ? rawCondition : "mint";
      const rawCategory = (listing.category || "smartphone").toLowerCase();
      const category =
        rawCategory === "laptop" ||
        rawCategory === "tablet" ||
        rawCategory === "wearable" ||
        rawCategory === "gaming"
          ? rawCategory
          : "smartphone";

      setLiveGadget({
        id: listing.id,
        title: listing.title,
        brand: listing.title.split(" ")[0] || "Verified",
        model: listing.title,
        category,
        price: listing.price_kobo,
        isPriceInKobo: true,
        condition,
        batteryHealth: listing.battery_health || 96,
        storage: listing.storage_capacity || "256GB",
        location: listing.location_city
          ? `${listing.location_city}${listing.location_state ? `, ${listing.location_state}` : ""}`
          : "Ikeja, Lagos",
        sellerName: listing.seller_name || "Verified Seller",
        sellerVerified: true,
        images:
          listing.image_urls && listing.image_urls.length > 0
            ? listing.image_urls
            : INITIAL_GADGETS[0].images,
        videoUrl: INITIAL_GADGETS[0].videoUrl,
      });
      setFailedListingId(null);
    }).catch(() => {
      if (active) {
        window.clearTimeout(lookupTimeout);
        setFailedListingId(requestedGadgetId);
      }
    });
    return () => {
      active = false;
      window.clearTimeout(lookupTimeout);
    };
  }, [fallbackGadget, requestedGadgetId]);

  useEffect(() => {
    if (searchParams.get("payment") !== "complete") return;
    let active = true;
    ordersApi.getById(orderId).then((result) => {
      if (!active) return;
      const status = result.data?.status?.toUpperCase();
      if (result.ok && (status === "FUNDED" || status === "FUNDS_HELD")) {
        setIsSuccess(true);
      } else {
        setPaymentError("Payment is not confirmed yet. Check the order status or try again.");
      }
    });
    return () => {
      active = false;
    };
  }, [orderId, searchParams]);

  const orderData: EscrowOrderData = {
    orderId,
    gadgetId: resolvedGadget.id,
    gadgetTitle: resolvedGadget.title,
    gadgetImage: resolvedGadget.images[0],
    condition: resolvedGadget.condition,
    amount: amountKobo / 100,
    escrowFee: escrowFeeKobo / 100,
    logisticsFee: logisticsFeeKobo / 100,
    totalDeposit: totalDepositKobo / 100,
    buyerName: "Adeola Fashola",
    sellerName: "Chidi Tech Hub",
    status: "PENDING_PAYMENT",
    courierPartner: "GIG Logistics Express",
  };

  const handlePaymentSuccess = (resolvedOrderId = orderId) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(resolvedOrderId);
      return;
    }
    router.push(`/escrow/${encodeURIComponent(resolvedOrderId)}`);
  };

  const handlePay = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const created = await ordersApi.create({
        listing_id: orderData.gadgetId,
        shipping_address: "14 Allen Avenue, Ikeja GRA, Lagos",
        logistics_provider: orderData.courierPartner,
        logistics_fee_kobo: orderData.logisticsFee * 100,
      });
      if (!created.ok || !created.data?.id) {
        throw new Error(created.error || "Unable to create the escrow order.");
      }
      const resolvedOrderId = created.data.id;
      if (!user?.email) {
        throw new Error("Your account email is unavailable. Sign in again before paying.");
      }

      const paystackInit = await paymentsApi.initializePaystack({
        order_id: resolvedOrderId,
        email: user.email,
        amount_kobo: orderData.totalDeposit * 100,
        callback_url: `${window.location.origin}/checkout/${encodeURIComponent(resolvedOrderId)}?gadget=${encodeURIComponent(resolvedGadget.id)}&payment=complete`,
      });
      if (!paystackInit.ok || !paystackInit.data?.authorization_url) {
        throw new Error(paystackInit.error || "Unable to initialize Paystack checkout.");
      }
      window.location.assign(paystackInit.data.authorization_url);
    } catch {
      setPaymentError("We couldn't start secure checkout. No funds are held; please try again shortly.");
      setIsProcessing(false);
    }
  };

  if (!gadget) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary">
        <Navbar />
        <main className="flex-1 w-full py-12">
          <div className="mx-auto max-w-xl px-4 sm:px-8 text-center">
            <h1 className="font-primary text-2xl font-bold text-[#111113]">
              {isListingLoading ? "Loading selected gadget" : "Gadget listing unavailable"}
            </h1>
            <p role={isListingLoading ? "status" : "alert"} className="mt-3 text-sm text-[#111113]/70">
              {isListingLoading
                ? "Confirming listing details before checkout."
                : "We couldn't confirm this listing, so checkout is unavailable."}
            </p>
            {!isListingLoading && (
              <Link href="/marketplace" className="mt-6 inline-flex underline underline-offset-4">
                Return to marketplace
              </Link>
            )}
          </div>
        </main>
        <MinimalistAuthFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#111113]/12">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em]">
              <Link
                href="/marketplace"
                onClick={onBackToGadget}
                className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Cancel &amp; Return</span>
              </Link>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="font-bold text-[#111113]">
                Escrow Checkout ({orderId})
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#15803d]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>Paystack Custody Secured</span>
            </div>
          </div>

          {isSuccess ? (
            /* Success State Confirmation */
            <div className="max-w-md mx-auto border border-[#111113] bg-white p-8 text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#15803d]/10 border border-[#15803d]/25 text-[#15803d]">
                <CheckCircle2 className="h-7 w-7 text-[#15803d]" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center rounded-full bg-[#15803d]/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#15803d]">
                  Escrow Vault Funded
                </span>
                <h2 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                  ₦{orderData.totalDeposit.toLocaleString("en-NG")} Locked in Escrow<span className="text-[#FF5A25]">.</span>
                </h2>
              </div>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 leading-relaxed">
                Your deposit has cleared into the segregated Paystack vault. The
                merchant has been notified to dispatch your gadget via insured
                courier.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handlePaymentSuccess()}
                  className="btn-primary w-full h-12 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                >
                  Enter Active Escrow Room
                </button>
              </div>
            </div>
          ) : (
            /* Two Column Checkout Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Payment Method Selector */}
              <div className="lg:col-span-7 space-y-6">
                <div className="border border-[#111113]/12 bg-white p-6 sm:p-8 space-y-6">
                  <div className="border-b border-[#111113]/12 pb-4">
                    <span className="label block mb-1">
                      [01] Custodial Funding Rail
                    </span>
                    <h1 className="font-primary text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                      Select Payment Method<span className="text-[#FF5A25]">.</span>
                    </h1>
                    <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
                      Choose how you want to fund the segregated Paystack escrow
                      holding vault.
                    </p>
                  </div>

                  <PaymentMethodSelector
                    selectedMethodId={selectedMethod}
                    onSelectMethod={(methodId) => setSelectedMethod(methodId)}
                  />
                </div>
              </div>

              {/* Right Column: Order Summary & Checkout Trigger */}
              <div className="lg:col-span-5 space-y-6">
                <OrderSummaryCard order={orderData} />

                {/* Checkout Trigger */}
                <div className="border border-[#111113]/12 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#111113]/12">
                    <span className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                      Authorize Escrow Hold
                    </span>
                    <span className="font-mono text-base font-bold text-[#111113]">
                      ₦{orderData.totalDeposit.toLocaleString("en-NG")}
                    </span>
                  </div>

                  {paymentError && (
                    <p role="alert" className="border border-[#f56565]/40 bg-[#f56565]/10 p-3 text-xs text-[#c53030]">
                      {paymentError}
                    </p>
                  )}

                  <SecureCheckoutButton
                    amount={orderData.totalDeposit}
                    isProcessing={isProcessing}
                    onPay={handlePay}
                  />

                  <p className="font-secondary text-[11px] text-[#111113]/65 text-center leading-relaxed">
                    By locking funds in escrow, you are protected by the 48-Hour
                    Diagnostic SLA and Custodial Escrow Agreement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Strategy 2: Minimalist Checkout Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
