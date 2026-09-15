import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = ["/", "/reset-password", "/admin/listings"];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

  const next = requestedNext && allowedNextPaths.includes(requestedNext) ? requestedNext : "/";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=no-code", requestUrl.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("AUTH CALLBACK ERROR:", error);

    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
