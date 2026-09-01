import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/catalog";
import CategoryFilter from "@/components/CategoryFilter";
import StoreFilter from "@/components/StoreFilter";
import SearchForm from "@/components/SearchForm";
import ProductCard from "@/components/ProductCard";
import type { ProductSummary } from "@/lib/types";

type HomeSearchParams = {
  q?: string;
  category?: string;
  store?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
};

function cheapestPrice(product: ProductSummary): number {
  return Math.min(...product.listings.map((l) => l.currentPrice));
}

function bestDiscount(product: ProductSummary): number {
  return Math.max(
    0,
    ...product.listings
      .filter((l) => l.listPrice && l.listPrice > l.currentPrice)
      .map((l) => 1 - l.currentPrice / (l.listPrice as number)),
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const { q, category, store, sort } = params;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const [stores, products] = await Promise.all([
    prisma.store.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        title: q ? { contains: q, mode: "insensitive" } : undefined,
        category: category ? { slug: category } : undefined,
        listings: store ? { some: { store: { slug: store } } } : undefined,
      },
      include: {
        category: true,
        listings: {
          where: { stock: true, store: store ? { slug: store } : undefined },
          include: { store: true },
        },
      },
      take: 60,
    }),
  ]);

  let visibleProducts = products.filter((p) => p.listings.length > 0) as ProductSummary[];

  if (minPrice !== undefined) {
    visibleProducts = visibleProducts.filter((p) => cheapestPrice(p) >= minPrice);
  }
  if (maxPrice !== undefined) {
    visibleProducts = visibleProducts.filter((p) => cheapestPrice(p) <= maxPrice);
  }

  visibleProducts = [...visibleProducts].sort((a, b) => {
    if (sort === "precio_desc") return cheapestPrice(b) - cheapestPrice(a);
    if (sort === "descuento") return bestDiscount(b) - bestDiscount(a);
    return cheapestPrice(a) - cheapestPrice(b); // precio_asc por defecto
  });

  const currentParams: Record<string, string | undefined> = {
    q,
    category,
    store,
    sort,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 space-y-4">
        <SearchForm defaultValue={q} category={category} store={store} sort={sort} />
        <CategoryFilter
          categories={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))}
          activeSlug={category}
          currentParams={currentParams}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StoreFilter
            stores={stores.map((s) => ({ slug: s.slug, name: s.name }))}
            activeSlug={store}
            currentParams={currentParams}
          />
          <div className="flex gap-1 text-xs">
            {[
              { key: "precio_asc", label: "Precio: menor a mayor" },
              { key: "precio_desc", label: "Precio: mayor a menor" },
              { key: "descuento", label: "Mayor descuento" },
            ].map((option) => (
              <a
                key={option.key}
                href={`/?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(category ? { category } : {}),
                  ...(store ? { store } : {}),
                  sort: option.key,
                }).toString()}`}
                className={`rounded px-2 py-1 ${
                  (sort ?? "precio_asc") === option.key
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          No hemos encontrado productos con esos filtros. Prueba a quitar
          alguno.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
