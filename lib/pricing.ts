import "server-only";
import { supabaseAdmin } from "./supabase-admin";
import { getStoreConfig } from "./config";
import { computeTotals, type Totals } from "./pricing-core";
import type { CartLine, Fulfillment, Product } from "./types";

export type PricedLine = {
  product: Product;
  qty: number;
  ginger: boolean;
  gingerCents: number;
  lineCents: number;
};

export type PricedCart = { lines: PricedLine[]; ginger: Product | null; totals: Totals };

export class CartError extends Error {}

// Re-prices the cart from the database so a tampered browser cart can never change what is charged.
export async function priceCart(raw: unknown, fulfillment: Fulfillment): Promise<PricedCart> {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) throw new CartError("Your cart is empty.");

  const items: CartLine[] = raw.map((r) => {
    const slug = typeof r?.slug === "string" ? r.slug : "";
    const qty = Number(r?.qty);
    if (!slug || !Number.isInteger(qty) || qty < 1 || qty > 24) throw new CartError("Your cart has an invalid item.");
    return { slug, qty, ginger: r?.ginger === true };
  });

  const { data, error } = await supabaseAdmin().from("products").select("*").eq("active", true);
  if (error) throw new Error(error.message);
  const products = (data ?? []) as Product[];
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const ginger = products.find((p) => p.kind === "addon" && p.slug === "ginger") ?? null;

  const lines: PricedLine[] = items.map((i) => {
    const product = bySlug.get(i.slug);
    if (!product || product.kind !== "juice") throw new CartError("An item in your cart is no longer available.");
    if (i.ginger && !ginger) throw new CartError("Ginger is not available right now.");
    const gingerCents = i.ginger && ginger ? ginger.price_cents : 0;
    return { product, qty: i.qty, ginger: i.ginger, gingerCents, lineCents: (product.price_cents + gingerCents) * i.qty };
  });

  const subtotal = lines.reduce((n, l) => n + l.lineCents, 0);
  return { lines, ginger, totals: computeTotals(subtotal, fulfillment, getStoreConfig()) };
}
