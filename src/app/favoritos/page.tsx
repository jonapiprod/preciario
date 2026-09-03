import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/dal";
import ProductCard from "@/components/ProductCard";
import FavoriteButton from "@/components/FavoriteButton";
import type { ProductSummary } from "@/lib/types";

export default async function FavoritesPage() {
  const user = await requireUser();

  const [favoriteProducts, favoriteCategories] = await Promise.all([
    prisma.favoriteProduct.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            listings: { where: { stock: true }, include: { store: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.favoriteCategory.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const products = favoriteProducts
    .map((f) => f.product)
    .filter((p) => p.listings.length > 0) as ProductSummary[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-gray-900">❤️ Tus favoritos</h1>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-gray-900">Categorías</h2>
      {favoriteCategories.length === 0 ? (
        <p className="text-sm text-gray-500">
          No has marcado ninguna categoría como favorita todavía.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {favoriteCategories.map((f) => (
            <span
              key={f.id}
              className="flex items-center gap-1 rounded-full border border-gray-300 bg-white pl-3 pr-2 py-1 text-sm"
            >
              <Link href={`/?category=${f.category.slug}`}>{f.category.name}</Link>
              <FavoriteButton
                kind="category"
                id={f.category.slug}
                initiallyFavorited
                isLoggedIn
                className="text-sm"
              />
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-3 text-lg font-semibold text-gray-900">Productos</h2>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">
          No has marcado ningún producto como favorito todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isFavorited isLoggedIn />
          ))}
        </div>
      )}
    </div>
  );
}
