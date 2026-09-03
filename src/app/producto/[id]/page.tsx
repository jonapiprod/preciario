import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/dal";
import FavoriteButton from "@/components/FavoriteButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      listings: {
        where: { stock: true },
        include: { store: true },
        orderBy: { currentPrice: "asc" },
      },
    },
  });

  if (!product) notFound();

  const user = await getCurrentUser();
  const isFavorited = user
    ? (await prisma.favoriteProduct.findUnique({
        where: { userId_productId: { userId: user.id, productId: product.id } },
      })) !== null
    : false;

  const cheapest = product.listings[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-red-600">
        &larr; Volver a la búsqueda
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg bg-white sm:w-64">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              unoptimized
              className="object-cover"
            />
          )}
        </div>
        <div>
          <span className="text-xs text-gray-500">{product.category.name}</span>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold text-gray-900">
            {product.title}
            <FavoriteButton
              kind="product"
              id={product.id}
              initiallyFavorited={isFavorited}
              isLoggedIn={user !== null}
            />
          </h1>
          {product.brand && (
            <p className="mt-1 text-sm text-gray-500">Marca: {product.brand}</p>
          )}
          {cheapest && (
            <p className="mt-4 font-display text-3xl font-bold text-red-600">
              {formatPrice(cheapest.currentPrice)}
              <span className="ml-2 text-sm font-normal text-gray-500">
                mejor precio en {cheapest.store.name}
              </span>
            </p>
          )}
        </div>
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold">
        Comparativa de precios ({product.listings.length}{" "}
        {product.listings.length === 1 ? "tienda" : "tiendas"})
      </h2>

      {product.listings.length === 0 ? (
        <p className="text-gray-500">
          No hay listados en stock para este producto ahora mismo.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {product.listings.map((listing, index) => {
            const discount =
              listing.listPrice && listing.listPrice > listing.currentPrice
                ? Math.round((1 - listing.currentPrice / listing.listPrice) * 100)
                : null;
            return (
              <a
                key={listing.id}
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 ${
                  index !== product.listings.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                      MEJOR PRECIO
                    </span>
                  )}
                  <span className="font-medium text-gray-900">{listing.store.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  {discount !== null && discount > 0 && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                      -{discount}%
                    </span>
                  )}
                  {listing.listPrice && listing.listPrice > listing.currentPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(listing.listPrice)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(listing.currentPrice)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
