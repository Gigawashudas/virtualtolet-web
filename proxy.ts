import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicRoute = pathname === "/" || pathname === "/rentals" || pathname.startsWith("/rentals/") || pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/auth/callback";

  // Public pages do not require authentication.
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected pages will be handled here later.
  // For now, allow the request through so we can isolate
  // whether the redirect problem comes from the proxy.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"],
};
