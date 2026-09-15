"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import VirtualToletLogo from "@/components/VirtualToletLogo";

const resetCallbackUrl = "https://www.virtualtolet.com/auth/callback?next=/reset-password";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: resetCallbackUrl,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage("If an account exists with this email, we’ve sent you a password reset link.");

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
        <div className="flex justify-center">
          <VirtualToletLogo />
        </div>

        <div className="mt-16">
          <Link href="/sign-in" className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-hover-text">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} />
            Back to sign in
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Forgot your password?</h1>

            <p className="mt-3 text-sm leading-6 text-text-secondary">Enter your email address and we’ll send you a secure link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-text-primary">
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" strokeWidth={1.8} />

                <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />
              </div>
            </div>

            {error && <p className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{error}</p>}

            {message && <p className="rounded-lg border border-brand-green/20 bg-brand-green/5 px-4 py-3 text-sm text-brand-green">{message}</p>}

            <button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-brand-green px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
