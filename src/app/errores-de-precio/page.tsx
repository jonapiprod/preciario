import { prisma } from "@/lib/prisma";
import PriceAlertCard from "@/components/PriceAlertCard";

export default async function PriceErrorsPage() {
  const alerts = await prisma.priceAlert.findMany({
    where: { status: "ACTIVE" },
    orderBy: { dropPercent: "desc" },
    include: {
      listing: {
        include: {
          product: true,
          store: true,
        },
      },
    },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">🔥 Errores de precio</h1>
      <p className="mt-2 text-sm text-gray-600">
        Caídas de precio de más del 60% respecto al histórico reciente del
        producto. Pueden ser errores de la tienda: se corrigen o se agotan
        muy rápido, así que verifica siempre el precio final antes de
        comprar.
      </p>

      {alerts.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          No hay errores de precio activos ahora mismo. Vuelve a comprobarlo
          más tarde.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {alerts.map((alert) => (
            <PriceAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
