"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/AuthContext";
import { MinimalistAuthFooter } from "@/components/footers";
import { authApi, setAuthSession } from "@/lib/api";

export default function MediatorInvitationPage() {
  return (
    <Suspense fallback={null}>
      <MediatorInvitationForm />
    </Suspense>
  );
}

function MediatorInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const token = searchParams.get("token") || "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await authApi.acceptMediatorInvitation({ token, name, password });
    setIsSubmitting(false);

    const user = result.data?.user;
    const authToken = result.data?.token || result.data?.access_token;
    if (!result.ok || !user || !authToken) {
      setError(result.error || "Unable to activate this mediator account.");
      return;
    }

    setAuthSession(authToken);
    setUser({
      id: user.id,
      email: user.email,
      name: user.name || name,
      role: "mediator",
      phone: user.phone,
      kycStatus: "pending",
      emailVerifiedAt: user.emailVerifiedAt || new Date().toISOString(),
    });
    router.replace("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col justify-between antialiased font-secondary">
      <div className="w-full border-b border-[#111113]/12 bg-white py-3.5 px-4 sm:px-6">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-[#111113]/65 hover:text-[#FF5A25]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </Link>
          <span className="font-primary text-xl font-extrabold tracking-[-0.05em]">
            SCROWPOINT<span className="text-[#FF5A25]">.</span>
          </span>
        </div>
      </div>

      <main className="my-auto w-full max-w-md self-center px-4 py-10 sm:px-6">
        <h1 className="font-primary text-2xl font-bold tracking-[-0.04em]">
          Set up your mediator account
        </h1>
        <p className="mt-2 text-sm text-[#111113]/65">
          Create your account to access dispute mediation.
        </p>

        {!token ? (
          <p role="alert" className="mt-6 border border-[#b91c1c]/25 bg-white p-4 text-sm text-[#b91c1c]">
            This invitation link is missing its token. Ask an administrator for a new link.
          </p>
        ) : (
          <form onSubmit={acceptInvitation} className="mt-6 space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Full name</span>
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-[#111113]/20 bg-white px-3 py-2.5 outline-none focus:border-[#FF5A25]"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Password</span>
              <input
                required
                type="password"
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[#111113]/20 bg-white px-3 py-2.5 outline-none focus:border-[#FF5A25]"
              />
              <span className="block text-xs font-normal text-[#111113]/60">
                Use at least 12 characters.
              </span>
            </label>
            {error && <p role="alert" className="text-sm text-[#b91c1c]">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#111113] px-4 py-3 text-sm font-bold text-white hover:bg-[#FF5A25] disabled:opacity-60"
            >
              {isSubmitting ? "Activating account…" : "Activate mediator account"}
            </button>
          </form>
        )}
      </main>

      <MinimalistAuthFooter />
    </div>
  );
}
