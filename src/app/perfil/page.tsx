import { requireUser } from "@/lib/auth/dal";
import TelegramLinkSection from "@/components/TelegramLinkSection";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
      <p className="mt-2 text-sm text-gray-600">{user.email}</p>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-gray-900">Alertas por Telegram</h2>
      <TelegramLinkSection
        connected={user.telegramChatId !== null}
        initialCode={user.telegramLinkCode}
      />
    </div>
  );
}
