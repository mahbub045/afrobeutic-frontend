import { pagesOptions } from "@/app/api/auth/[...nextauth]/pages-options";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Debug logging
    console.log("Middleware - Path:", path);
    console.log("Middleware - Token role:", token?.role);

    // Check if token or role is missing
    if (!token || !token.role) {
      console.log("Middleware - No token or role, redirecting to login");
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Role-based path protection
    if (path.startsWith("/dashboard/admin-panel")) {
      if (
        token.role !== "MANAGEMENT_ADMIN" &&
        token.role !== "MANAGEMENT_STAFF"
      ) {
        console.log(
          `Middleware - Access denied to dashboard/admin-panel. Role: ${token.role}, Required: MANAGEMENT_ADMIN | MANAGEMENT_STAFF`,
        );
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("error", "access_denied");
        return NextResponse.redirect(loginUrl);
      }
      console.log("Middleware - Access granted to dashboard/admin-panel");
    }

    if (path.startsWith("/dashboard/client-panel")) {
      const allowedRoles = ["OWNER", "ADMIN", "STAFF"];
      if (!allowedRoles.includes(token.role as string)) {
        console.log(
          `Middleware - Access denied to dashboard/client-panel. Role: ${
            token.role
          }, Allowed: ${allowedRoles.join(", ")}`,
        );
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("error", "access_denied");
        return NextResponse.redirect(loginUrl);
      }
      console.log("Middleware - Access granted to dashboard/client-panel");
    }

    // General dashboard protection - all authenticated users
    if (path.startsWith("/dashboard") && path !== "/dashboard") {
      console.log(
        "Middleware - Access granted to dashboard (authenticated user)",
      );
    }

    return NextResponse.next();
  },
  {
    pages: {
      ...pagesOptions,
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/admin-panel",
    "/dashboard/admin-panel/:path*",
    "/dashboard/client-panel",
    "/dashboard/client-panel/:path*",
    "/dashboard/:path*",
    "/auth/login",
  ],
};
