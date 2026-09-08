import { NextResponse } from "next/server";
import { getActiveAdapters } from "@/lib/adapters/registry";
import { ingestFromAllActiveAdapters } from "@/lib/ingest";

// Vercel Cron invoca esta ruta con GET (ver vercel.json); se deja también
// POST para poder disparar una ingesta manual con curl/Postman. Protegido
// con CRON_SECRET para que no sea invocable públicamente.
async function handleIngest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET no está configurado: se rechaza la ingesta por seguridad.");
    return NextResponse.json({ error: "No configurado" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const summaries = await ingestFromAllActiveAdapters(getActiveAdapters());
  return NextResponse.json({ summaries });
}

export async function GET(request: Request) {
  return handleIngest(request);
}

export async function POST(request: Request) {
  return handleIngest(request);
}
