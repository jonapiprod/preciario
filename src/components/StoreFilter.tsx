import Link from "next/link";
import { buildHref } from "@/lib/url";

interface StoreFilterProps {
  stores: { slug: string; name: string }[];
  activeSlug?: string;
  currentParams: Record<string, string | undefined>;
}

export default function StoreFilter({ stores, activeSlug, currentParams }: StoreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref("/", currentParams, { store: undefined })}
        className={`rounded-full border px-3 py-1 text-xs transition ${
          !activeSlug
            ? "border-gray-900 bg-gray-900 text-white"
            : "border-gray-300 bg-white hover:border-gray-500"
        }`}
      >
        Todas las tiendas
      </Link>
      {stores.map((store) => {
        const isActive = store.slug === activeSlug;
        return (
          <Link
            key={store.slug}
            href={buildHref("/", currentParams, {
              store: isActive ? undefined : store.slug,
            })}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              isActive
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white hover:border-gray-500"
            }`}
          >
            {store.name}
          </Link>
        );
      })}
    </div>
  );
}
