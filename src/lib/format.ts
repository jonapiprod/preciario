const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(value: number): string {
  return eurFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
