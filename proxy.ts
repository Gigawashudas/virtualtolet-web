import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log("🔥🔥🔥 PROXY EXECUTED:", request.nextUrl.pathname);

  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export const config = {
  matcher: "/:path*",
};
