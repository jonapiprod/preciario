import type { PriceSourceAdapter, RawListing } from "./types";

// Parser genérico para los feeds de producto que entregan la mayoría de
// redes de afiliación en España (Awin, TradeDoubler, Webgains, ...): un CSV
// descargable por URL, actualizado periódicamente, con una fila por
// producto. Las columnas varían según la red/tienda, por eso el mapeo de
// columnas se pasa como configuración en vez de venir hardcodeado.
//
// Cuando tengas acceso a un feed real, pásame una fila de ejemplo (con los
// nombres de cabecera) y termino de ajustar `columnMap` a ese formato
// concreto — la lógica de parseo de abajo ya es reutilizable.

export interface CsvColumnMap {
  ean?: string;
  title: string;
  brand?: string;
  model?: string;
  categorySlug: string;
  price: string;
  listPrice?: string;
  currency?: string;
  url: string;
  imageUrl?: string;
  stock?: string;
}

export interface CsvFeedConfig {
  storeSlug: string;
  storeName: string;
  affiliateNetwork: "AWIN" | "TRADEDOUBLER" | "MANUAL_CSV";
  feedUrl: string;
  delimiter?: string;
  columnMap: CsvColumnMap;
}

function parseCsv(text: string, delimiter: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, "")));
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return true;
  return !["0", "false", "no", "out_of_stock", "agotado"].includes(value.toLowerCase());
}

export function createCsvFeedAdapter(config: CsvFeedConfig): PriceSourceAdapter {
  const delimiter = config.delimiter ?? ",";

  return {
    storeSlug: config.storeSlug,
    storeName: config.storeName,
    affiliateNetwork: config.affiliateNetwork,
    async fetchListings(): Promise<RawListing[]> {
      const response = await fetch(config.feedUrl);
      if (!response.ok) {
        throw new Error(
          `No se pudo descargar el feed de ${config.storeName} (${response.status})`,
        );
      }
      const text = await response.text();
      const rows = parseCsv(text, delimiter);
      if (rows.length === 0) return [];

      const [header, ...dataRows] = rows;
      const colIndex = (name?: string) => (name ? header.indexOf(name) : -1);

      const idx = {
        ean: colIndex(config.columnMap.ean),
        title: colIndex(config.columnMap.title),
        brand: colIndex(config.columnMap.brand),
        model: colIndex(config.columnMap.model),
        categorySlug: colIndex(config.columnMap.categorySlug),
        price: colIndex(config.columnMap.price),
        listPrice: colIndex(config.columnMap.listPrice),
        currency: colIndex(config.columnMap.currency),
        url: colIndex(config.columnMap.url),
        imageUrl: colIndex(config.columnMap.imageUrl),
        stock: colIndex(config.columnMap.stock),
      };

      return dataRows
        .map((row): RawListing | null => {
          const title = row[idx.title];
          const priceRaw = row[idx.price];
          const url = row[idx.url];
          if (!title || !priceRaw || !url) return null;

          const price = Number(priceRaw.replace(",", "."));
          if (!Number.isFinite(price)) return null;

          return {
            ean: idx.ean >= 0 ? row[idx.ean] : undefined,
            title,
            brand: idx.brand >= 0 ? row[idx.brand] : undefined,
            model: idx.model >= 0 ? row[idx.model] : undefined,
            categorySlug: idx.categorySlug >= 0 ? row[idx.categorySlug] : "otros",
            price,
            listPrice:
              idx.listPrice >= 0 && row[idx.listPrice]
                ? Number(row[idx.listPrice].replace(",", "."))
                : undefined,
            currency: idx.currency >= 0 ? row[idx.currency] : "EUR",
            url,
            imageUrl: idx.imageUrl >= 0 ? row[idx.imageUrl] : undefined,
            stock: idx.stock >= 0 ? parseBoolean(row[idx.stock]) : true,
          };
        })
        .filter((listing): listing is RawListing => listing !== null);
    },
  };
}
