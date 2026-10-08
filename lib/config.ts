import type { StoreConfig } from "./types";

function num(v: string | undefined, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function getStoreConfig(): StoreConfig {
  return {
    deliveryFeeCents: Math.round(num(process.env.DELIVERY_FEE_CENTS)),
    freeDeliveryMinCents: Math.round(num(process.env.FREE_DELIVERY_MIN_CENTS)),
    taxPercent: num(process.env.TAX_PERCENT),
  };
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
