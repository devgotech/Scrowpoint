"use client";

import React, { useState } from "react";
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * CameraCaptureWidget Component (Phase 2 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Live selfie biometric capture widget powered by SmileID.
 * - Viewfinder with face oval guide and liveness cues ("Blink", "Smile").
 * - Token Compliance: 8px container radius, 4px controls, 200ms ease-out transitions.
 * - Mobile responsive: responsive aspect ratio fitting modern smartphone screens.
 */

export interface CameraCaptureWidgetProps {
  onCaptureComplete?: (photoUrl: string) => void;
  className?: string;
}

export function CameraCaptureWidget({
  onCaptureComplete,
  className,
}: CameraCaptureWidgetProps) {
  const [stage, setStage] = useState<"idle" | "ready" | "capturing" | "captured">("ready");
  const [livenessPrompt, setLivenessPrompt] = useState<string>("Align your face inside the oval");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const mockSelfies = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  ];

  const handleStartCapture = () => {
    setStage("capturing");
    setLivenessPrompt("Please blink your eyes slowly...");

    setTimeout(() => {
      setLivenessPrompt("Hold still for 3D depth scan...");
      setTimeout(() => {
        const chosen = mockSelfies[Math.floor(Math.random() * mockSelfies.length)];
        setCapturedImage(chosen);
        setStage("captured");
        setLivenessPrompt("Biometric liveness confirmed!");
        onCaptureComplete?.(chosen);
      }, 1200);
    }, 1200);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStage("ready");
    setLivenessPrompt("Align your face inside the oval");
  };

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white p-6 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-[#111113] text-white">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <span className="font-primary text-xs font-bold text-[#111113] tracking-[-0.02em]">
            SmileID 3D Liveness Selfie
          </span>
        </div>
        <Badge variant="trust" className="text-[10px] font-mono">
          Anti-Spoofing
        </Badge>
      </div>

      {/* Viewfinder Canvas */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#111113] flex items-center justify-center border border-[#111113]/12">
        {stage === "captured" && capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured biometric selfie"
            className="h-full w-full object-cover"
          />
        ) : (
          /* Live Camera Viewfinder Simulation */
          <div className="relative h-full w-full flex items-center justify-center bg-[#111113]">
            {/* Dark Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Oval Face Silhouette Guide */}
            <div
              className={cn(
                "relative z-10 h-52 w-40 rounded-[50%] border-2 transition-all duration-300 ease-out flex items-center justify-center",
                stage === "capturing"
                  ? "border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse"
                  : "border-white/60"
              )}
            >
              <div className="text-center p-2">
                <span className="font-mono text-[10px] text-white/70 block uppercase tracking-wider">
                  Face Oval
                </span>
              </div>
            </div>

            {/* Corner Bracket Guides */}
            <div className="absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-white/40" />
            <div className="absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-white/40" />
            <div className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-white/40" />
            <div className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-white/40" />
          </div>
        )}

        {/* Liveness Guidance Prompt Banner */}
        <div className="absolute bottom-3 inset-x-3 bg-[#111113]/85 backdrop-blur-xs text-white p-2.5 text-center font-mono text-xs flex items-center justify-center gap-2">
          {stage === "capturing" ? (
            <RefreshCw className="h-3.5 w-3.5 text-[#ecc94b] animate-spin" />
          ) : stage === "captured" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
          )}
          <span>{livenessPrompt}</span>
        </div>
      </div>

      {/* Controls & Action Buttons */}
      <div className="pt-2">
        {stage === "captured" ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleRetake}
              className="flex-1 h-11 rounded-full text-xs font-semibold gap-1.5 border-[#111113]/20 bg-white hover:bg-[#F8F7F4] text-[#111113]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Photo</span>
            </Button>

            <div className="flex-1 flex items-center justify-center rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#15803d] font-mono text-xs font-bold gap-1.5 px-3">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <span>Liveness Verified</span>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={stage === "capturing"}
            onClick={handleStartCapture}
            className="w-full h-11 rounded-full text-xs font-semibold gap-2"
          >
            <Camera className="h-4 w-4" />
            <span>{stage === "capturing" ? "Scanning Biometrics..." : "Take Live 3D Selfie"}</span>
          </Button>
        )}
      </div>

      <div className="text-[11px] font-secondary text-[#111113]/60 text-center leading-relaxed">
        Photos are never stored publicly. Used strictly for one-time verification against national ID databases.
      </div>
    </div>
  );
}

export default CameraCaptureWidget;
