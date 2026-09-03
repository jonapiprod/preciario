import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatPrice, formatPercent } from "@/lib/format";

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

  const message = isError
    ? `🔥 <b>¡Posible error de precio!</b>\n${title}\nAhora a ${formatPrice(newPrice)} en ${storeName} (antes ~${formatPrice(
        notification.referencePrice ?? previousPrice,
      )}, -${formatPercent(notification.dropPercent ?? 0)})`
    : `📉 <b>Bajada de precio</b>\n${title}\nAhora a ${formatPrice(newPrice)} en ${storeName} (antes ${formatPrice(previousPrice)})`;

  await Promise.all(
    users.map((u) => sendTelegramMessage(u.telegramChatId as string, message)),
  );
}
