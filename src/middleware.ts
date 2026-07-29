export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/knowledge-base/:path*",
    "/assets/:path*",
    "/sla/:path*",
    "/analytics/:path*",
    "/teams/:path*",
    "/admin/:path*",
    "/team/:path*",
    "/settings/:path*",
  ],
};
