// Interfaz común que debe implementar cualquier fuente de precios: un feed
// de afiliados (Awin/TradeDoubler), la API de Amazon (PA-API) o el adaptador
// de datos de ejemplo. El motor de ingesta (ingest.ts) solo conoce esta
// interfaz, nunca los detalles de cada tienda.

export interface RawListing {
  ean?: string;
  title: string;
  brand?: string;
  model?: string;
  categorySlug: string;
  price: number;
  listPrice?: number;
  currency?: string;
  url: string;
  imageUrl?: string;
  stock?: boolean;
}

export interface PriceSourceAdapter {
  storeSlug: string;
  storeName: string;
  affiliateNetwork: "AMAZON_PAAPI" | "AWIN" | "TRADEDOUBLER" | "MANUAL_CSV" | "MOCK";
  fetchListings(): Promise<RawListing[]>;
}
