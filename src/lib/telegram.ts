export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!response.ok) {
      console.error("Error enviando mensaje de Telegram:", await response.text());
    }
  } catch (error) {
    console.error("Error enviando mensaje de Telegram:", error);
  }
}
