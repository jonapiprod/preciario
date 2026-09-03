import { prisma } from "@/lib/prisma";
import { evaluatePriceDrop } from "@/lib/priceDetection";
import { notifyFavoritedUsers } from "@/lib/telegramAlerts";
import type { PriceSourceAdapter, RawListing } from "@/lib/adapters/types";

const HISTORY_WINDOW = 14;

async function resolveCategoryId(categorySlug: string): Promise<string> {
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: {},
    create: { slug: categorySlug, name: categorySlug },
  });
  return category.id;
}

async function resolveProductId(listing: RawListing, categoryId: string): Promise<string> {
  if (listing.ean) {
    const product = await prisma.product.upsert({
      where: { ean: listing.ean },
      update: {
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        imageUrl: listing.imageUrl ?? undefined,
        categoryId,
      },
      create: {
        ean: listing.ean,
        title: listing.title,
        brand: listing.brand,
        model: listing.model,
        imageUrl: listing.imageUrl,
        categoryId,
      },
    });
    return product.id;
  }

  // Sin EAN no podemos deduplicar de forma fiable entre tiendas: se crea
  // (o reutiliza por título exacto) un producto propio de esa tienda.
  const existing = await prisma.product.findFirst({
    where: { title: listing.title, ean: null },
  });
  if (existing) return existing.id;

  const created = await prisma.product.create({
    data: {
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      imageUrl: listing.imageUrl,
      categoryId,
    },
  });
  return created.id;
}

export interface IngestSummary {
  storeSlug: string;
  listingsProcessed: number;
  alertsCreated: number;
  error?: string;
}

async function ingestListing(storeId: string, storeName: string, listing: RawListing): Promise<boolean> {
  const categoryId = await resolveCategoryId(listing.categorySlug);
  const productId = await resolveProductId(listing, categoryId);

  const existingListing = await prisma.listing.findUnique({
    where: { productId_storeId: { productId, storeId } },
  });
  const previousPrice = existingListing?.currentPrice;

  const history = existingListing
    ? await prisma.priceHistory.findMany({
        where: { listingId: existingListing.id },
        orderBy: { capturedAt: "desc" },
        take: HISTORY_WINDOW,
      })
    : [];

  const evaluation = evaluatePriceDrop(
    history.map((h) => ({ price: h.price, capturedAt: h.capturedAt })),
    listing.price,
  );

  const upsertedListing = await prisma.listing.upsert({
    where: { productId_storeId: { productId, storeId } },
    update: {
      url: listing.url,
      currentPrice: listing.price,
      listPrice: listing.listPrice,
      currency: listing.currency ?? "EUR",
      stock: listing.stock ?? true,
      lastSeenAt: new Date(),
    },
    create: {
      productId,
      storeId,
      url: listing.url,
      currentPrice: listing.price,
      listPrice: listing.listPrice,
      currency: listing.currency ?? "EUR",
      stock: listing.stock ?? true,
    },
  });

  await prisma.priceHistory.create({
    data: { listingId: upsertedListing.id, price: listing.price },
  });

  if (evaluation?.isError) {
    await prisma.priceAlert.create({
      data: {
        listingId: upsertedListing.id,
        dropPercent: evaluation.dropPercent,
        referencePrice: evaluation.referencePrice,
        newPrice: listing.price,
      },
    });
    await notifyFavoritedUsers({
      productId,
      categoryId,
      title: listing.title,
      storeName,
      newPrice: listing.price,
      previousPrice: previousPrice ?? evaluation.referencePrice,
      isError: true,
      referencePrice: evaluation.referencePrice,
      dropPercent: evaluation.dropPercent,
    });
    return true;
  }

  if (previousPrice !== undefined && listing.price < previousPrice) {
    await notifyFavoritedUsers({
      productId,
      categoryId,
      title: listing.title,
      storeName,
      newPrice: listing.price,
      previousPrice,
      isError: false,
    });
  }

  return false;
}

export async function ingestFromAdapter(adapter: PriceSourceAdapter): Promise<IngestSummary> {
  const store = await prisma.store.upsert({
    where: { slug: adapter.storeSlug },
    update: { name: adapter.storeName, affiliateNetwork: adapter.affiliateNetwork },
    create: {
      slug: adapter.storeSlug,
      name: adapter.storeName,
      affiliateNetwork: adapter.affiliateNetwork,
    },
  });

  try {
    const listings = await adapter.fetchListings();
    let alertsCreated = 0;
    for (const listing of listings) {
      const created = await ingestListing(store.id, adapter.storeName, listing);
      if (created) alertsCreated++;
    }
    return { storeSlug: adapter.storeSlug, listingsProcessed: listings.length, alertsCreated };
  } catch (error) {
    return {
      storeSlug: adapter.storeSlug,
      listingsProcessed: 0,
      alertsCreated: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function ingestFromAllActiveAdapters(
  adapters: PriceSourceAdapter[],
): Promise<IngestSummary[]> {
  const summaries: IngestSummary[] = [];
  for (const adapter of adapters) {
    summaries.push(await ingestFromAdapter(adapter));
  }
  return summaries;
}
