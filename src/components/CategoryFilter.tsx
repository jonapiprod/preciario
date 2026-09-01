import Link from "next/link";
import { buildHref } from "@/lib/url";

interface CategoryFilterProps {
  categories: { slug: string; name: string }[];
  activeSlug?: string;
  currentParams: Record<string, string | undefined>;
}

export default function CategoryFilter({
  categories,
  activeSlug,
  currentParams,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref("/", currentParams, { category: undefined })}
        className={`rounded-full border px-3 py-1 text-sm transition ${
          !activeSlug
            ? "border-orange-600 bg-orange-600 text-white"
            : "border-gray-300 bg-white hover:border-orange-400"
        }`}
      >
        Todas las categorías
      </Link>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <Link
            key={category.slug}
            href={buildHref("/", currentParams, {
              category: isActive ? undefined : category.slug,
            })}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              isActive
                ? "border-orange-600 bg-orange-600 text-white"
                : "border-gray-300 bg-white hover:border-orange-400"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
