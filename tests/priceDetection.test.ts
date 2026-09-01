import { describe, expect, it } from "vitest";
import { evaluatePriceDrop, median } from "@/lib/priceDetection";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

describe("median", () => {
  it("calcula la mediana de una lista impar", () => {
    expect(median([10, 30, 20])).toBe(20);
  });

  it("calcula la mediana de una lista par", () => {
    expect(median([10, 20, 30, 40])).toBe(25);
  });
});

describe("evaluatePriceDrop", () => {
  it("no evalúa nada si no hay histórico suficiente", () => {
    const history = [
      { price: 100, capturedAt: daysAgo(1) },
      { price: 100, capturedAt: daysAgo(2) },
    ];
    expect(evaluatePriceDrop(history, 30, 0.6)).toBeNull();
  });

  it("no marca error de precio con una caída del 50%", () => {
    const history = [
      { price: 100, capturedAt: daysAgo(1) },
      { price: 100, capturedAt: daysAgo(2) },
      { price: 100, capturedAt: daysAgo(3) },
    ];
    const result = evaluatePriceDrop(history, 50, 0.6);
    expect(result).not.toBeNull();
    expect(result?.isError).toBe(false);
    expect(result?.dropPercent).toBeCloseTo(0.5);
  });

  it("marca error de precio con una caída del 65% y histórico suficiente", () => {
    const history = [
      { price: 100, capturedAt: daysAgo(1) },
      { price: 102, capturedAt: daysAgo(2) },
      { price: 98, capturedAt: daysAgo(3) },
    ];
    const result = evaluatePriceDrop(history, 35, 0.6);
    expect(result).not.toBeNull();
    expect(result?.isError).toBe(true);
    expect(result?.referencePrice).toBe(100);
  });

  it("respeta un umbral configurable distinto del 60%", () => {
    const history = [
      { price: 100, capturedAt: daysAgo(1) },
      { price: 100, capturedAt: daysAgo(2) },
      { price: 100, capturedAt: daysAgo(3) },
    ];
    const result = evaluatePriceDrop(history, 60, 0.3);
    expect(result?.isError).toBe(true);
  });
});
