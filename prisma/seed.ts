import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORIES } from "../src/lib/catalog";
import { getAllMockAdapters } from "../src/lib/adapters/mockAdapter";
import { evaluatePriceDrop } from "../src/lib/priceDetection";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// EANs a los que forzamos una caída de precio > 60% en la última ingesta,
// para que la página de "errores de precio" tenga contenido nada más
// arrancar el proyecto. Cada entrada es [ean, storeSlug].
const FORCED_PRICE_ERRORS: Array<[string, string]> = [
  ["0000000000031", "pccomponentes"], // Tarjeta gráfica RTX 4070
  ["0000000000021", "mediamarkt"], // Portátil UltraBook Pro
  ["0000000000061", "amazon-es"], // Consola PlayVerse Series X
];

const HISTORY_DAYS = 5;

async function main() {
  console.log("Sembrando categorías...");
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { slug: category.slug, name: category.name },
    });
  }

  console.log("Sembrando tiendas y listados...");
  const adapters = getAllMockAdapters();

  for (const adapter of adapters) {
    const store = await prisma.store.upsert({
      where: { slug: adapter.storeSlug },
      update: { name: adapter.storeName, affiliateNetwork: adapter.affiliateNetwork },
      create: {
        slug: adapter.storeSlug,
        name: adapter.storeName,
        affiliateNetwork: adapter.affiliateNetwork,
      },
    });

    const listings = await adapter.fetchListings();

    for (const listing of listings) {
      const category = await prisma.category.findUniqueOrThrow({
        where: { slug: listing.categorySlug },
      });

      const product = await prisma.product.upsert({
        where: { ean: listing.ean! },
        update: {
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          imageUrl: listing.imageUrl,
          categoryId: category.id,
        },
        create: {
          ean: listing.ean,
          title: listing.title,
          brand: listing.brand,
          model: listing.model,
          imageUrl: listing.imageUrl,
          categoryId: category.id,
        },
      });

      const dbListing = await prisma.listing.upsert({
        where: { productId_storeId: { productId: product.id, storeId: store.id } },
        update: {
          url: listing.url,
          currentPrice: listing.price,
          listPrice: listing.listPrice,
          currency: listing.currency ?? "EUR",
          stock: listing.stock ?? true,
        },
        create: {
          productId: product.id,
          storeId: store.id,
          url: listing.url,
          currentPrice: listing.price,
          listPrice: listing.listPrice,
          currency: listing.currency ?? "EUR",
          stock: listing.stock ?? true,
        },
      });

      // Histórico de los últimos días con el precio "normal" de la tienda.
      const historyPoints: { price: number; capturedAt: Date }[] = [];
      for (let daysAgo = HISTORY_DAYS; daysAgo >= 1; daysAgo--) {
        const capturedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        historyPoints.push({ price: listing.price, capturedAt });
        await prisma.priceHistory.create({
          data: { listingId: dbListing.id, price: listing.price, capturedAt },
        });
      }

      const forcedError = FORCED_PRICE_ERRORS.find(
        ([ean, storeSlug]) => ean === listing.ean && storeSlug === store.slug,
      );

      if (forcedError) {
        const droppedPrice = Math.round(listing.price * 0.35 * 100) / 100; // ~65% de caída
        const evaluation = evaluatePriceDrop(historyPoints, droppedPrice);

        await prisma.listing.update({
          where: { id: dbListing.id },
          data: { currentPrice: droppedPrice, lastSeenAt: new Date() },
        });
        await prisma.priceHistory.create({
          data: { listingId: dbListing.id, price: droppedPrice },
        });

        if (evaluation?.isError) {
          await prisma.priceAlert.create({
            data: {
              listingId: dbListing.id,
              dropPercent: evaluation.dropPercent,
              referencePrice: evaluation.referencePrice,
              newPrice: droppedPrice,
            },
          });
        }
      }
    }
  }

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
