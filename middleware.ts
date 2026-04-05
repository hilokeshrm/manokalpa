import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy",
  "/terms",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/contact",
];

const ADMIN_PATHS = ["/admin"];
const COUNSELLOR_PATHS = ["/counsellor"];
const SUPERVISOR_PATHS = ["/supervisor"];
const USER_PATHS = ["/dashboard", "/appointments", "/assessments", "/journal", "/events", "/content", "/chat", "/profile"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "?"))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/logo")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Role-based access
    if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (COUNSELLOR_PATHS.some(p => pathname.startsWith(p)) && !["COUNSELLOR", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (SUPERVISOR_PATHS.some(p => pathname.startsWith(p)) && !["SUPERVISOR", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo|public).*)",
  ],
};
