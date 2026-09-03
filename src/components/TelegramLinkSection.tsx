"use client";

import { useState, useTransition } from "react";
import { generateTelegramLinkCode, unlinkTelegram } from "@/app/actions/telegram";

interface TelegramLinkSectionProps {
  connected: boolean;
  initialCode: string | null;
}

export default function TelegramLinkSection({ connected, initialCode }: TelegramLinkSectionProps) {
  const [code, setCode] = useState(initialCode);
  const [isPending, startTransition] = useTransition();

  if (connected) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">✅ Telegram conectado</p>
        <p className="mt-1 text-sm text-green-700">
          Recibirás avisos cuando bajen de precio tus productos y categorías favoritas.
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => unlinkTelegram())}
          className="mt-3 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          Desconectar Telegram
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-700">
        Conecta Telegram para recibir avisos de bajadas de precio en tus favoritos.
      </p>
      {code ? (
        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <p>
            1. Abre Telegram y busca al bot de ChollosTech.
          </p>
          <p>
            2. Envíale el mensaje:{" "}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono">/start {code}</code>
          </p>
        </div>
      ) : null}
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const newCode = await generateTelegramLinkCode();
            setCode(newCode);
          })
        }
        className="mt-3 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {code ? "Generar otro código" : "Generar código de vinculación"}
      </button>
    </div>
  );
}
