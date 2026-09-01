import { getAllMockAdapters } from "./mockAdapter";
import type { PriceSourceAdapter } from "./types";

// Punto único donde se decide qué fuentes de precios están activas. Hoy
// solo hay adaptadores MOCK (datos de ejemplo). Cuando tengas un feed real
// (Awin/TradeDoubler) o acceso a PA-API, créalo con createCsvFeedAdapter /
// createAmazonPaapiAdapter y añádelo aquí — no hace falta tocar el resto de
// la app, todos hablan la misma interfaz PriceSourceAdapter.
export function getActiveAdapters(): PriceSourceAdapter[] {
  return [...getAllMockAdapters()];
}
