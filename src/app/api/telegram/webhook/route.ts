import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

interface TelegramUpdate {
  message?: {
    text?: string;
    chat: { id: number };
  };
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const update = (await request.json()) as TelegramUpdate;
  const text = update.message?.text;
  const chatId = update.message?.chat.id;

  if (text?.startsWith("/start ") && chatId !== undefined) {
    const code = text.slice("/start ".length).trim();
    const user = await prisma.user.findUnique({ where: { telegramLinkCode: code } });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: String(chatId), telegramLinkCode: null },
      });
      await sendTelegramMessage(
        String(chatId),
        "✅ Tu cuenta de ChollosTech está conectada. Te avisaremos aquí cuando bajen de precio tus favoritos.",
      );
    } else {
      await sendTelegramMessage(
        String(chatId),
        "No hemos reconocido ese código. Genera uno nuevo desde tu perfil en ChollosTech.",
      );
    }
  }

  // Telegram espera un 200 rápido; cualquier otro update se ignora.
  return NextResponse.json({ ok: true });
}
