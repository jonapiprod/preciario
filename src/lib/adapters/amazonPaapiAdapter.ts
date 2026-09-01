import { createHash, createHmac } from "node:crypto";
import type { PriceSourceAdapter, RawListing } from "./types";

// Adaptador para Amazon Product Advertising API (PA-API) 5.0, operación
// SearchItems (marketplace www.amazon.es). Implementa la firma AWS
// Signature V4 tal como la exige PA-API.
//
// REQUIERE una cuenta de Amazon Asociados aprobada con acceso a PA-API
// (normalmente exige ventas cualificadas en los últimos 180 días) y estas
// variables de entorno:
//   AMAZON_PAAPI_ACCESS_KEY
//   AMAZON_PAAPI_SECRET_KEY
//   AMAZON_PAAPI_PARTNER_TAG
// Sin ellas, `isConfigured()` devuelve false y este adaptador se omite en
// la ingesta (ver registry.ts). No se ha podido probar contra la API real
// todavía: verifica el mapeo de campos en cuanto tengas acceso.

const HOST = "webservices.amazon.es";
const REGION = "eu-west-1";
const ENDPOINT = `https://${HOST}/paapi5/searchitems`;

interface AmazonPaapiConfig {
  searchKeywordsByCategory: Record<string, string>; // categorySlug -> keyword de búsqueda
}

function isConfigured(): boolean {
  return Boolean(
    process.env.AMAZON_PAAPI_ACCESS_KEY &&
      process.env.AMAZON_PAAPI_SECRET_KEY &&
      process.env.AMAZON_PAAPI_PARTNER_TAG,
  );
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

// Firma SigV4 simplificada de PA-API 5.0: solo firma sobre
// content-encoding, content-type, host, x-amz-content-sha256, x-amz-date y
// x-amz-target (ver documentación oficial de Amazon Advertising API).
function signRequest(payload: string, amzDate: string, target: string) {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY!;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY!;
  const dateStamp = amzDate.slice(0, 8);

  const headers: Record<string, string> = {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    host: HOST,
    "x-amz-content-sha256": sha256Hex(payload),
    "x-amz-date": amzDate,
    "x-amz-target": target,
  };

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((k) => `${k}:${headers[k]}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");

  const canonicalRequest = [
    "POST",
    "/paapi5/searchitems",
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, "ProductAdvertisingAPI");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { headers, authorizationHeader };
}

interface PaapiItem {
  ASIN: string;
  ItemInfo?: { Title?: { DisplayValue?: string }; ByLineInfo?: { Brand?: { DisplayValue?: string } } };
  Images?: { Primary?: { Large?: { URL?: string } } };
  Offers?: {
    Listings?: Array<{
      Price?: { Amount?: number; Currency?: string };
      SavingBasis?: { Amount?: number };
    }>;
  };
  DetailPageURL?: string;
}

async function searchItems(keyword: string): Promise<PaapiItem[]> {
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";

  const payload = JSON.stringify({
    Keywords: keyword,
    PartnerTag: process.env.AMAZON_PAAPI_PARTNER_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.es",
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "Images.Primary.Large",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
    ],
  });

  const { headers, authorizationHeader } = signRequest(payload, amzDate, target);

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { ...headers, Authorization: authorizationHeader },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Amazon PA-API respondió ${response.status}: ${await response.text()}`);
  }

  const json = (await response.json()) as { SearchResult?: { Items?: PaapiItem[] } };
  return json.SearchResult?.Items ?? [];
}

export function createAmazonPaapiAdapter(config: AmazonPaapiConfig): PriceSourceAdapter {
  return {
    storeSlug: "amazon-es",
    storeName: "Amazon.es",
    affiliateNetwork: "AMAZON_PAAPI",
    async fetchListings(): Promise<RawListing[]> {
      if (!isConfigured()) {
        throw new Error(
          "AmazonPaapiAdapter no está configurado: faltan AMAZON_PAAPI_ACCESS_KEY / " +
            "AMAZON_PAAPI_SECRET_KEY / AMAZON_PAAPI_PARTNER_TAG en el entorno.",
        );
      }

      const results: RawListing[] = [];
      for (const [categorySlug, keyword] of Object.entries(config.searchKeywordsByCategory)) {
        const items = await searchItems(keyword);
        for (const item of items) {
          const listing = item.Offers?.Listings?.[0];
          if (!listing?.Price?.Amount) continue;

          results.push({
            title: item.ItemInfo?.Title?.DisplayValue ?? item.ASIN,
            brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
            categorySlug,
            price: listing.Price.Amount,
            listPrice: listing.SavingBasis?.Amount,
            currency: listing.Price.Currency ?? "EUR",
            url: item.DetailPageURL ?? `https://www.amazon.es/dp/${item.ASIN}`,
            imageUrl: item.Images?.Primary?.Large?.URL,
            stock: true,
          });
        }
      }
      return results;
    },
  };
}

export { isConfigured as isAmazonPaapiConfigured };
