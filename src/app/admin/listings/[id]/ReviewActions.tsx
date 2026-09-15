"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ReviewActionsProps = {
  listingId: string;
};

export default function ReviewActions({ listingId }: ReviewActionsProps) {
  const router = useRouter();

  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function review(result: "confirmed" | "rejected") {
    if (loading) {
      return;
    }

    if (result === "rejected" && !notes.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: reviewError } = await supabase.rpc("admin_review_listing", {
      p_listing_id: listingId,
      p_result: result,
      p_notes: notes.trim() || null,
    });

    if (reviewError) {
      console.error("LISTING REVIEW ERROR:", reviewError);
      setError(reviewError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin/listings");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-green">Admin decision</p>

        <h2 className="mt-2 text-xl font-extrabold">Review this listing</h2>

        <p className="mt-2 text-sm leading-6 text-text-secondary">Confirm the listing if the submitted information is acceptable. Reject it when corrections are required.</p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm font-medium text-brand-red">{error}</div>}

      {rejecting && (
        <div className="mb-5">
          <label htmlFor="rejection-notes" className="mb-2 block text-sm font-bold">
            Rejection reason
          </label>

          <textarea id="rejection-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Explain what needs to be corrected." rows={5} disabled={loading} className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-text-muted focus:border-brand-green disabled:opacity-50" />
        </div>
      )}

      <div className="space-y-3">
        <button type="button" onClick={() => review("confirmed")} disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          {loading && !rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Verify & publish
        </button>

        {!rejecting ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setRejecting(true);
            }}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-bold transition hover:bg-hover-background hover:border-hover-border hover:text-hover-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject listing
          </button>
        ) : (
          <button type="button" onClick={() => review("rejected")} disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-brand-red/30 px-5 text-sm font-bold text-brand-red transition hover:bg-brand-red/5 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Confirm rejection
          </button>
        )}

        {rejecting && !loading && (
          <button
            type="button"
            onClick={() => {
              setRejecting(false);
              setNotes("");
              setError("");
            }}
            className="w-full py-2 text-sm font-semibold text-text-secondary transition hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
