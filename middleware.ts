import { pagesOptions } from "@/app/api/auth/[...nextauth]/pages-options";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if token exists first
    if (!token) {
      console.log("Middleware - No token, redirecting to login");
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Get user role directly from token
    const role = token.role as string | undefined;

    // Debug logging
    console.log("Middleware - Path:", path);
    console.log("Middleware - Token role:", role);

    // Check if role is missing
    if (!role) {
      console.log("Middleware - No role, redirecting to login");
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // Role-based path protection
    if (path.startsWith("/dashboard/admin-panel")) {
      if (role !== "MANAGEMENT_ADMIN" && role !== "MANAGEMENT_STAFF") {
        console.log(
          `Middleware - Access denied to dashboard/admin-panel. Role: ${role}, Required: MANAGEMENT_ADMIN | MANAGEMENT_STAFF`,
        );
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("error", "access_denied");
        return NextResponse.redirect(loginUrl);
      }
      console.log("Middleware - Access granted to dashboard/admin-panel");
    }

    if (path.startsWith("/dashboard/client-panel")) {
      const allowedRoles = ["OWNER", "ADMIN", "STAFF"];
      if (!allowedRoles.includes(role)) {
        console.log(
          `Middleware - Access denied to dashboard/client-panel. Role: ${role}, Allowed: ${allowedRoles.join(", ")}`,
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
