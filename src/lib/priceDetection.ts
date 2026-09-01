export interface PricePoint {
  price: number;
  capturedAt: Date;
}

export interface PriceDropEvaluation {
  isError: boolean;
  referencePrice: number;
  dropPercent: number;
}

// Never flag on a single prior data point: one bad feed value alone must not
// trigger a "price error" alert.
export const MIN_HISTORY_POINTS = 3;

export function getDropThreshold(): number {
  const raw = process.env.PRICE_ERROR_DROP_THRESHOLD;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 && parsed < 1 ? parsed : 0.6;
}

export function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error("median() requires at least one value");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Compares a new price against a robust reference price (median of recent
// history) to decide whether it looks like a genuine "price error" deal.
// Returns null when there isn't enough history to judge reliably yet.
export function evaluatePriceDrop(
  history: PricePoint[],
  newPrice: number,
  dropThreshold: number = getDropThreshold(),
): PriceDropEvaluation | null {
  if (history.length < MIN_HISTORY_POINTS) {
    return null;
  }

  const referencePrice = median(history.map((point) => point.price));
  if (referencePrice <= 0) {
    return null;
  }

  const dropPercent = (referencePrice - newPrice) / referencePrice;
  return {
    isError: dropPercent >= dropThreshold,
    referencePrice,
    dropPercent,
  };
}
