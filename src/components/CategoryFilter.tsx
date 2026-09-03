import Link from "next/link";
import { buildHref } from "@/lib/url";
import FavoriteButton from "@/components/FavoriteButton";

interface CategoryFilterProps {
  categories: { slug: string; name: string }[];
  activeSlug?: string;
  currentParams: Record<string, string | undefined>;
  favoritedSlugs?: Set<string>;
  isLoggedIn?: boolean;
}

export default function CategoryFilter({
  categories,
  activeSlug,
  currentParams,
  favoritedSlugs,
  isLoggedIn = false,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref("/", currentParams, { category: undefined })}
        className={`rounded-full border px-3 py-1 text-sm transition ${
          !activeSlug
            ? "border-red-600 bg-red-600 text-white"
            : "border-gray-300 bg-white hover:border-red-400"
        }`}
      >
        Todas las categorías
      </Link>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <span
            key={category.slug}
            className={`flex items-center gap-1 rounded-full border pl-3 pr-2 py-1 text-sm transition ${
              isActive
                ? "border-red-600 bg-red-600 text-white"
                : "border-gray-300 bg-white hover:border-red-400"
            }`}
          >
            <Link
              href={buildHref("/", currentParams, {
                category: isActive ? undefined : category.slug,
              })}
            >
              {category.name}
            </Link>
            <FavoriteButton
              kind="category"
              id={category.slug}
              initiallyFavorited={favoritedSlugs?.has(category.slug) ?? false}
              isLoggedIn={isLoggedIn}
              className="text-sm"
            />
          </span>
        );
      })}
    </div>
  );
}
