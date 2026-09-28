import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  const user = claims?.sub ? claims : null;

  const pathname = request.nextUrl.pathname;

  /*
   * Public routes
   */
  const isPublicRoute = pathname === "/" || pathname === "/rentals" || pathname.startsWith("/rentals/") || pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/auth/callback";

  if (isPublicRoute) {
    return supabaseResponse;
  }

  /*
   * All remaining application routes require authentication.
   */
  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);

    signInUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

    const redirectResponse = NextResponse.redirect(signInUrl);

    /*
     * Preserve any refreshed Supabase cookies/headers.
     */
    redirectResponse.cookies.setAll(supabaseResponse.cookies.getAll());

    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = supabaseResponse.headers.get(header);

      if (value) {
        redirectResponse.headers.set(header, value);
      }
    }

    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"],
};
