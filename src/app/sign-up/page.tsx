"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import GoogleLogo from "@/components/GoogleLogo";
import { createClient } from "@/lib/supabase/client";

const authCallbackUrl = "https://virtualtolet.com/auth/callback";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: authCallbackUrl,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user && !data.session) {
      setVerificationSent(true);
      return;
    }

    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setVerificationSent(true);
  }

  async function handleGoogleSignUp() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: authCallbackUrl,
      },
    });

    if (googleError) {
      setGoogleLoading(false);
      setError(googleError.message);
    }
  }

  async function handleResendVerification() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setMessage("");
    setResending(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: authCallbackUrl,
      },
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setMessage("A new verification email has been sent.");
  }

  if (verificationSent) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
          <div className="mb-10">
            <button
              type="button"
              onClick={() => {
                setVerificationSent(false);
                setError("");
                setMessage("");
              }}
              className="group flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-hover-text"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} />
              Back
            </button>
          </div>

          <div>
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-brand-green" aria-hidden="true">
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.7" />
                <path d="m5.5 6 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Check your email</h1>

            <p className="mt-4 text-sm leading-6 text-text-secondary">We sent a verification link to</p>

            <p className="mt-1 break-all text-sm font-bold text-text-primary">{email}</p>

            <p className="mt-4 text-sm leading-6 text-text-secondary">Open the email and click the verification link to activate your Virtual To-let account.</p>
          </div>

          <div className="mt-8">
            {error && <div className="mb-4 rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{error}</div>}

            {message && <div className="mb-4 rounded-lg border border-brand-green/20 bg-brand-green/5 px-4 py-3 text-sm text-brand-green">{message}</div>}

            <button type="button" onClick={handleResendVerification} disabled={resending} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-green px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-text-muted">Check your spam or junk folder if you do not see the email.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-10">
          <button type="button" onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-hover-text">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} />
            Back
          </button>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-brand-green">VIRTUAL TO-LET</p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary">Create your account</h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary">Find a place that feels like home.</p>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-bold text-text-primary">
              Email
            </label>

            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-bold text-text-primary">
              Password
            </label>

            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="h-12 w-full rounded-lg border border-border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />

              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-hover-text">
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-xs font-bold text-text-primary">
              Confirm password
            </label>

            <div className="relative">
              <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" className="h-12 w-full rounded-lg border border-border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />

              <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-hover-text">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{error}</div>}

          <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-green px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-text-muted">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button type="button" onClick={handleGoogleSignUp} disabled={googleLoading} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-5 text-sm font-bold text-text-primary transition-colors hover:border-hover-border hover:bg-hover-background disabled:cursor-not-allowed disabled:opacity-60">
          <GoogleLogo className="h-5 w-5" />
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <button type="button" onClick={() => router.push("/sign-in")} className="font-bold text-brand-green transition-colors hover:text-hover-text">
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}
