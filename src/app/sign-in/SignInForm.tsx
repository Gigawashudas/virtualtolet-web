"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import VirtualToletLogo from "@/components/VirtualToletLogo";
import GoogleLogo from "@/components/GoogleLogo";

type SignInFormProps = {
  redirectTo: string;
};

export default function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    const supabase = createClient();

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (googleError) {
      setError(googleError.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-6 py-8 sm:px-8">
        <div className="flex justify-center">
          <VirtualToletLogo />
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full">
            <div className="mb-8 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-green">Welcome back</p>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Sign in to Virtual To-let</h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-secondary">Find your next home and manage everything from one place.</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
              <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading || loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-bold text-text-primary transition-colors hover:border-hover-border hover:bg-hover-background hover:text-hover-text disabled:cursor-not-allowed disabled:opacity-60">
                <GoogleLogo />
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />

                <span className="text-xs font-medium text-text-muted">OR</span>

                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold text-text-primary">
                    Email
                  </label>

                  <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-bold text-text-primary">
                      Password
                    </label>

                    <Link href="/forgot-password" className="text-xs font-bold text-text-secondary transition-colors hover:text-hover-text">
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete="current-password" required className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />

                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-hover-text">
                      {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.8} /> : <Eye className="h-5 w-5" strokeWidth={1.8} />}
                    </button>
                  </div>
                </div>

                {error && <p className="rounded-xl border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{error}</p>}

                <button type="submit" disabled={loading || googleLoading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green text-sm font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Signing in..." : "Sign in"}

                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-bold text-brand-green transition-colors hover:text-hover-text">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted">© 2026 Virtual To-let</p>
      </div>
    </main>
  );
}
