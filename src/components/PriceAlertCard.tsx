import Image from "next/image";
import Link from "next/link";
import { formatPercent, formatPrice } from "@/lib/format";

export interface PriceAlertSummary {
  id: string;
  dropPercent: number;
  referencePrice: number;
  newPrice: number;
  detectedAt: Date;
  listing: {
    url: string;
    product: { id: string; title: string; imageUrl: string | null };
    store: { name: string };
  };
}

export default function PriceAlertCard({ alert }: { alert: PriceAlertSummary }) {
  return (
    <div className="flex gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white">
        {alert.listing.product.imageUrl && (
          <Image
            src={alert.listing.product.imageUrl}
            alt={alert.listing.product.title}
            fill
            unoptimized
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="w-fit rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
          -{formatPercent(alert.dropPercent)} de golpe
        </span>
        <Link
          href={`/producto/${alert.listing.product.id}`}
          className="text-sm font-medium text-gray-900 hover:text-orange-600"
        >
          {alert.listing.product.title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(alert.newPrice)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            {formatPrice(alert.referencePrice)}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          en {alert.listing.store.name} · detectado el{" "}
          {alert.detectedAt.toLocaleDateString("es-ES")}
        </span>
      </div>
    </div>
  );
}
