import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = ["/", "/post-to-let", "/reset-password", "/admin/listings"];

function getSafeRedirectPath(value: string | null) {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (allowedNextPaths.includes(value)) {
    return value;
  }

  return "/";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const requestedRedirect = requestUrl.searchParams.get("redirect");

  const redirectTo = getSafeRedirectPath(requestedRedirect);

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=no-code", requestUrl.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("AUTH CALLBACK ERROR:", error);

    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
