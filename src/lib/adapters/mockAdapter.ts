import { CATALOG } from "@/lib/catalog";
import type { PriceSourceAdapter, RawListing } from "./types";

interface MockStoreConfig {
  slug: string;
  name: string;
  // Multiplicador respecto al basePrice del catálogo, para que cada tienda
  // simulada tenga precios ligeramente distintos (como en la realidad).
  priceMultiplier: number;
  // Fracción de productos del catálogo que esta tienda no tiene en stock.
  catalogCoverage: number;
}

export const MOCK_STORES: MockStoreConfig[] = [
  { slug: "amazon-es", name: "Amazon.es", priceMultiplier: 1.0, catalogCoverage: 1 },
  { slug: "pccomponentes", name: "PcComponentes", priceMultiplier: 0.98, catalogCoverage: 0.85 },
  { slug: "mediamarkt", name: "MediaMarkt", priceMultiplier: 1.03, catalogCoverage: 0.9 },
  { slug: "el-corte-ingles", name: "El Corte Inglés", priceMultiplier: 1.08, catalogCoverage: 0.7 },
  { slug: "fnac", name: "Fnac", priceMultiplier: 1.02, catalogCoverage: 0.75 },
  { slug: "carrefour", name: "Carrefour", priceMultiplier: 0.99, catalogCoverage: 0.6 },
  { slug: "coolmod", name: "Coolmod", priceMultiplier: 0.95, catalogCoverage: 0.5 },
];

// Jitter pequeño y determinista (basado en el EAN) para que cada tienda no
// muestre exactamente el mismo precio, sin depender de Math.random().
function deterministicJitter(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  }
  // Entre -3% y +3%
  return ((hash / 1000) - 0.5) * 0.06;
}

export function createMockAdapter(config: MockStoreConfig): PriceSourceAdapter {
  return {
    storeSlug: config.slug,
    storeName: config.name,
    affiliateNetwork: "MOCK",
    async fetchListings(): Promise<RawListing[]> {
      const coverageCutoff = Math.ceil(CATALOG.length * config.catalogCoverage);
      return CATALOG.slice(0, coverageCutoff).map((item) => {
        const jitter = deterministicJitter(item.ean + config.slug);
        const price = Math.round(item.basePrice * config.priceMultiplier * (1 + jitter) * 100) / 100;
        return {
          ean: item.ean,
          title: item.title,
          brand: item.brand,
          model: item.model,
          categorySlug: item.categorySlug,
          price,
          listPrice: Math.round(item.basePrice * 1.1 * 100) / 100,
          currency: "EUR",
          url: `https://${config.slug}.example.es/dp/${item.ean}?tag=demo-affiliate`,
          imageUrl: item.imageUrl,
          stock: true,
        };
      });
    },
  };
}

export function getAllMockAdapters(): PriceSourceAdapter[] {
  return MOCK_STORES.map(createMockAdapter);
}
