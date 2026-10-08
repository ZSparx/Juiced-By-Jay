import type { Fulfillment, StoreConfig } from "./types";

export type Totals = {
  subtotalCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  totalCents: number;
};

// Shared by the checkout page (estimate) and the server (the real charge).
export function computeTotals(
  subtotalCents: number,
  fulfillment: Fulfillment,
  cfg: StoreConfig
): Totals {
  const qualifiesForFree =
    cfg.freeDeliveryMinCents > 0 && subtotalCents >= cfg.freeDeliveryMinCents;
  const deliveryFeeCents =
    fulfillment === "delivery" && !qualifiesForFree ? cfg.deliveryFeeCents : 0;
  const taxCents = Math.round(
    ((subtotalCents + deliveryFeeCents) * cfg.taxPercent) / 100
  );
  return {
    subtotalCents,
    deliveryFeeCents,
    taxCents,
    totalCents: subtotalCents + deliveryFeeCents + taxCents,
  };
}
