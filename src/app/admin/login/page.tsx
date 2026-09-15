"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import VirtualToletLogo from "@/components/VirtualToletLogo";
import GoogleLogo from "@/components/GoogleLogo";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/listings`,
      },
    });

    if (googleError) {
      console.error("ADMIN GOOGLE LOGIN ERROR:", googleError);
      setError("Unable to sign in with Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center">
            <VirtualToletLogo />
          </div>

          <div className="border border-border bg-background p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-11 w-11 items-center justify-center border border-border">
                  <ShieldCheck className="h-5 w-5 text-brand-green" strokeWidth={1.8} />
                </div>
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Administrator</p>

              <h1 className="text-2xl font-extrabold tracking-tight">Admin login</h1>

              <p className="mt-2 text-sm text-text-secondary">Sign in with your authorized Google account.</p>
            </div>

            {error && <div className="mb-5 border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{error}</div>}

            <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="flex w-full items-center justify-center gap-3 border border-border bg-button-background px-5 py-3 text-sm font-bold text-button-text transition hover:border-hover-border hover:bg-hover-background hover:text-hover-text disabled:cursor-not-allowed disabled:opacity-60">
              <GoogleLogo />
              {loading ? "Signing in..." : "Continue with Google"}
              {!loading && <ArrowRight className="ml-auto h-4 w-4" strokeWidth={1.8} />}
            </button>

            <div className="mt-8 border-t border-border pt-6 text-center">
              <Link href="/" className="text-sm font-semibold text-text-secondary transition hover:text-hover-text">
                Back to Virtual To-let
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
