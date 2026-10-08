import { NextResponse } from "next/server";
import type { Square } from "square";
import { SITE_URL, getStoreConfig } from "@/lib/config";
import { CartError, priceCart } from "@/lib/pricing";
import { squareClient, squareConfigured } from "@/lib/square";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Fulfillment } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  if (!squareConfigured()) {
    return fail("Online payments aren't switched on yet. Please check back soon.", 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.");
  }

  const fulfillment: Fulfillment = body.fulfillment === "pickup" ? "pickup" : "delivery";
  const c = (body.customer ?? {}) as Record<string, unknown>;
  const a = (body.address ?? {}) as Record<string, unknown>;
  const name = clean(c.name, 120);
  const email = clean(c.email, 200);
  const phone = clean(c.phone, 30);
  if (!name) return fail("Please enter your name.");
  if (!EMAIL.test(email)) return fail("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a phone number.");

  const address = {
    line1: clean(a.line1, 200),
    line2: clean(a.line2, 200),
    city: clean(a.city, 100),
    state: clean(a.state, 2).toUpperCase(),
    postalCode: clean(a.postalCode, 10),
  };
  if (fulfillment === "delivery") {
    if (!address.line1 || !address.city) return fail("Please enter your delivery address.");
    if (!/^[A-Z]{2}$/.test(address.state)) return fail("Please enter a 2-letter state.");
    if (!/^\d{5}(-\d{4})?$/.test(address.postalCode)) return fail("Please enter a valid ZIP code.");
  }
  const notes = clean(body.notes, 500);

  let priced;
  try {
    priced = await priceCart(body.items, fulfillment);
  } catch (e) {
    if (e instanceof CartError) return fail(e.message);
    console.error("priceCart failed", e);
    return fail("We couldn't price your cart. Please try again.", 500);
  }
  const { lines, ginger, totals } = priced;

  const db = supabaseAdmin();
  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      fulfillment,
      address_line1: fulfillment === "delivery" ? address.line1 : null,
      address_line2: fulfillment === "delivery" && address.line2 ? address.line2 : null,
      city: fulfillment === "delivery" ? address.city : null,
      state: fulfillment === "delivery" ? address.state : null,
      postal_code: fulfillment === "delivery" ? address.postalCode : null,
      delivery_notes: notes || null,
      subtotal_cents: totals.subtotalCents,
      delivery_fee_cents: totals.deliveryFeeCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
    })
    .select("id, order_number")
    .single();
  if (orderErr || !order) {
    console.error("order insert failed", orderErr);
    return fail("We couldn't save your order. Please try again.", 500);
  }

  const { error: itemsErr } = await db.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      name: l.product.name,
      unit_price_cents: l.product.price_cents,
      quantity: l.qty,
      ginger: l.ginger,
      ginger_price_cents: l.gingerCents,
      line_total_cents: l.lineCents,
    }))
  );
  if (itemsErr) {
    console.error("order items insert failed", itemsErr);
    await db.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
    return fail("We couldn't save your order. Please try again.", 500);
  }

  const money = (cents: number): Square.Money => ({ amount: BigInt(cents), currency: "USD" });
  const lineItems: Square.OrderLineItem[] = [];
  for (const l of lines) {
    lineItems.push({ name: l.product.name, quantity: String(l.qty), basePriceMoney: money(l.product.price_cents) });
    if (l.ginger && ginger) {
      lineItems.push({ name: `Add ginger (${l.product.name})`, quantity: String(l.qty), basePriceMoney: money(l.gingerCents) });
    }
  }
  if (totals.deliveryFeeCents > 0) {
    lineItems.push({ name: "Local delivery", quantity: "1", basePriceMoney: money(totals.deliveryFeeCents) });
  }
  const cfg = getStoreConfig();

  try {
    const res = await squareClient().checkout.paymentLinks.create({
      idempotencyKey: order.id,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        referenceId: order.id,
        lineItems,
        ...(cfg.taxPercent > 0
          ? { taxes: [{ uid: "sales-tax", name: "Sales tax", percentage: String(cfg.taxPercent), scope: "ORDER" as const }] }
          : {}),
      },
      checkoutOptions: { redirectUrl: `${SITE_URL}/order/${order.id}`, askForShippingAddress: false },
      prePopulatedData: { buyerEmail: email },
      paymentNote: `Juiced By Jay order #${order.order_number}`,
    });

    const url = res.paymentLink?.url;
    if (!url) throw new Error("Square did not return a payment link");
    await db.from("orders").update({ square_order_id: res.paymentLink?.orderId ?? null }).eq("id", order.id);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Square payment link failed", e);
    await db.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
    return fail("We couldn't start the payment. Please try again in a moment.", 502);
  }
}

