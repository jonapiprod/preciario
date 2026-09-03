import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/google";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  const response = NextResponse.redirect(getGoogleAuthUrl(state, redirectUri));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
