"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth, type UserProfile } from "@/components/providers/AuthContext";

type AuthFormProps = {
  mode: "login" | "signup";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    (value.role === "buyer" || value.role === "seller" || value.role === "admin") &&
    (value.kycStatus === "pending" ||
      value.kycStatus === "approved" ||
      value.kycStatus === "rejected" ||
      value.kycStatus === "manual_review_required")
  );
}

function getResponseError(payload: unknown): string | null {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return null;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuth();
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
      ...(isSignup
        ? { name: formData.get("name"), role: "buyer" }
        : {}),
    };

    try {
      const response = await fetch(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(credentials),
        }
      );
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error(
          "The authentication service returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          getResponseError(payload) ??
            "Unable to authenticate. Please try again."
        );
      }

      if (
        typeof payload !== "object" ||
        payload === null ||
        !("data" in payload) ||
        !isUserProfile(payload.data)
      ) {
        throw new Error(
          "The authentication service returned an invalid response."
        );
      }

      const user = payload.data;
      setUser(user);

      const requestedPath = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      const destination = requestedPath
        ? new URL(requestedPath, window.location.origin)
        : new URL("/dashboard", window.location.origin);
      window.location.assign(
        destination.origin === window.location.origin
          ? `${destination.pathname}${destination.search}${destination.hash}`
          : "/dashboard"
      );
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Unable to authenticate. Please try again."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col justify-center py-8 sm:py-14">
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-xl shadow-foreground/5">
        <CardHeader className="items-center space-y-3 px-6 pb-5 pt-8 text-center sm:px-8 sm:pt-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-trust/10 text-trust">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-heading text-2xl font-bold tracking-tight">
              {isSignup ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {isSignup
                ? "Join Buyer's High for safer gadget trading."
                : "Sign in to manage your secure gadget trades."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="auth-name"
                >
                  Full name
                </label>
                <Input
                  autoComplete="name"
                  id="auth-name"
                  name="name"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="auth-email">
                Email address
              </label>
              <Input
                autoComplete="email"
                id="auth-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="auth-password">
                Password
              </label>
              <Input
                autoComplete={isSignup ? "new-password" : "current-password"}
                id="auth-password"
                minLength={isSignup ? 8 : undefined}
                name="password"
                placeholder={isSignup ? "At least 8 characters" : "Your password"}
                required
                type="password"
              />
            </div>

            {submitMessage && (
              <p
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {submitMessage}
              </p>
            )}

            <Button
              className="h-11 w-full font-semibold"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "New to Buyer's High?"}{" "}
            <Link
              className="font-semibold text-foreground underline-offset-4 hover:underline"
              href={isSignup ? "/login" : "/signup"}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
