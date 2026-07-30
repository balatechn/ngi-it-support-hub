import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as { role?: string } | null;
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/chat/:path*",
    "/knowledge-base/:path*",
    "/analytics/:path*",
    "/admin/:path*",
    "/team/:path*",
    "/assets/:path*",
    "/teams/:path*",
  ],
};
