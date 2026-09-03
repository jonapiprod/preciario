import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { exchangeCodeForTokens, verifyGoogleIdToken } from "@/lib/auth/google";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = (await cookies()).get(STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    const response = NextResponse.redirect(new URL("/login?error=google", url));
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  try {
    const { id_token } = await exchangeCodeForTokens(code, redirectUri);
    const identity = await verifyGoogleIdToken(id_token);

    if (!identity.emailVerified) {
      const response = NextResponse.redirect(new URL("/login?error=google_email", url));
      response.cookies.delete(STATE_COOKIE);
      return response;
    }

    let user = await prisma.user.findUnique({ where: { googleId: identity.sub } });

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: identity.email } });
      user = existingByEmail
        ? await prisma.user.update({
            where: { id: existingByEmail.id },
            data: { googleId: identity.sub },
          })
        : await prisma.user.create({
            data: { email: identity.email, googleId: identity.sub, passwordHash: null },
          });
    }

    await createSession(user.id);
    const response = NextResponse.redirect(new URL("/", url));
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (error) {
    console.error("Error en el login con Google:", error);
    const response = NextResponse.redirect(new URL("/login?error=google", url));
    response.cookies.delete(STATE_COOKIE);
    return response;
  }
}
