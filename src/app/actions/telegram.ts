"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/dal";

export async function generateTelegramLinkCode(): Promise<string> {
  const user = await requireUser();

  const code = randomBytes(4).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramLinkCode: code },
  });

  revalidatePath("/perfil");
  return code;
}

export async function unlinkTelegram(): Promise<void> {
  const user = await requireUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: null, telegramLinkCode: null },
  });

  revalidatePath("/perfil");
}
