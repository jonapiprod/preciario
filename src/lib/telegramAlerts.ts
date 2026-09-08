import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatPrice, formatPercent } from "@/lib/format";

// El texto se envía con parse_mode "HTML" (ver sendTelegramMessage): hay que
// escapar cualquier valor que no controlemos nosotros (título del producto,
// nombre de la tienda) antes de interpolarlo, o un feed de afiliados hostil
// podría inyectar marcado en el mensaje.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface PriceDropNotification {
  productId: string;
  categoryId: string;
  title: string;
  storeName: string;
  newPrice: number;
  previousPrice: number;
  isError: boolean;
  referencePrice?: number;
  dropPercent?: number;
}

export async function notifyFavoritedUsers(notification: PriceDropNotification): Promise<void> {
  const { productId, categoryId, title, storeName, newPrice, previousPrice, isError } = notification;

  const users = await prisma.user.findMany({
    where: {
      telegramChatId: { not: null },
      OR: [
        { favoriteProducts: { some: { productId } } },
        { favoriteCategories: { some: { categoryId } } },
      ],
    },
    select: { telegramChatId: true },
  });

  if (users.length === 0) return;

  const safeTitle = escapeHtml(title);
  const safeStoreName = escapeHtml(storeName);

  const message = isError
    ? `🔥 <b>¡Posible error de precio!</b>\n${safeTitle}\nAhora a ${formatPrice(newPrice)} en ${safeStoreName} (antes ~${formatPrice(
        notification.referencePrice ?? previousPrice,
      )}, -${formatPercent(notification.dropPercent ?? 0)})`
    : `📉 <b>Bajada de precio</b>\n${safeTitle}\nAhora a ${formatPrice(newPrice)} en ${safeStoreName} (antes ${formatPrice(previousPrice)})`;

  await Promise.all(
    users.map((u) => sendTelegramMessage(u.telegramChatId as string, message)),
  );
}
