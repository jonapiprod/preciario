import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/session";

const PROTECTED_ROUTES = ["/favoritos", "/perfil"];
const AUTH_ROUTES = ["/login", "/registro"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await decrypt(request.cookies.get("session")?.value);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/favoritos/:path*", "/perfil/:path*", "/login", "/registro"],
};
