"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import VirtualToletLogo from "@/components/VirtualToletLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {" "}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
        {" "}
        <div className="flex justify-center">
          {" "}
          <VirtualToletLogo />{" "}
        </div>
        <div className="mt-16">
          <button type="button" onClick={() => router.push("/sign-in")} className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-hover-text">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} />
            Back to sign in
          </button>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Set a new password</h1>

            <p className="mt-3 text-sm leading-6 text-text-secondary">Choose a new password for your Virtual To-let account.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-text-primary">
                New password
              </label>

              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="h-12 w-full rounded-lg border border-border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />

                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-hover-text">
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-text-primary">
                Confirm new password
              </label>

              <div className="relative">
                <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" className="h-12 w-full rounded-lg border border-border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-green" />

                <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-hover-text">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">{error}</p>}

            <button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-brand-green px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
