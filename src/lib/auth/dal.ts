import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decrypt, readSessionToken } from "@/lib/auth/session";

export const getSession = cache(async () => {
  const token = await readSessionToken();
  return decrypt(token);
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, telegramChatId: true, telegramLinkCode: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
