import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  /*
   * Public routes
   *
   * These pages can be accessed without authentication.
   */
  const isPublicRoute = pathname === "/" || pathname === "/rentals" || pathname.startsWith("/rentals/") || pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/auth/callback";

  if (isPublicRoute) {
    return response;
  }

  /*
   * All remaining application routes require authentication.
   *
   * Preserve the requested path so the user can be returned
   * to it after signing in.
   */
  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);

    signInUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run proxy on application routes while skipping
     * Next.js internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
