import "server-only";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function getRequestOrigin(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function sendVerificationEmail(email: string, token: string, origin: string): Promise<void> {
  const link = `${origin}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verifica tu cuenta de ChollosTech",
    html: `
      <p>Gracias por registrarte en ChollosTech.</p>
      <p>Confirma tu cuenta pulsando este enlace (caduca en 24 horas):</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si no has sido tú, puedes ignorar este email.</p>
    `,
  });
}
