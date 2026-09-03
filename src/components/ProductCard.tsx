import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({
  product,
  isFavorited = false,
  isLoggedIn = false,
}: {
  product: ProductSummary;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}) {
  if (product.listings.length === 0) return null;

  const cheapest = [...product.listings].sort((a, b) => a.currentPrice - b.currentPrice)[0];
  const storeCount = product.listings.length;
  const discount =
    cheapest.listPrice && cheapest.listPrice > cheapest.currentPrice
      ? Math.round((1 - cheapest.currentPrice / cheapest.listPrice) * 100)
      : null;

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-100">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
          />
        )}
        {discount !== null && discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        <FavoriteButton
          kind="product"
          id={product.id}
          initiallyFavorited={isFavorited}
          isLoggedIn={isLoggedIn}
          className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 shadow-sm"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs text-gray-500">{product.category.name}</span>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-orange-600">
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(cheapest.currentPrice)}
          </span>
          {cheapest.listPrice && cheapest.listPrice > cheapest.currentPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(cheapest.listPrice)}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          en {cheapest.store.name}
          {storeCount > 1 ? ` · comparado en ${storeCount} tiendas` : ""}
        </span>
      </div>
    </Link>
  );
}
