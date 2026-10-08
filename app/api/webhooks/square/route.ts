import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function validSignature(raw: string, signature: string, key: string, url: string): boolean {
  const expected = createHmac("sha256", key).update(url + raw).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Square calls this when a payment changes. Configure a webhook subscription for
// `payment.updated` pointing at SQUARE_WEBHOOK_URL.
export async function POST(req: Request) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !url) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";
  if (!validSignature(raw, signature, key, url)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: { payment?: { id?: string; order_id?: string; status?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const payment = event.data?.object?.payment;
  if (!event.type?.startsWith("payment.") || !payment?.order_id) return NextResponse.json({ ok: true });

  const db = supabaseAdmin();
  if (payment.status === "COMPLETED") {
    const { error } = await db
      .from("orders")
      .update({ status: "paid", payment_status: "paid", square_payment_id: payment.id ?? null })
      .eq("square_order_id", payment.order_id)
      .neq("payment_status", "paid");
    if (error) {
      console.error("webhook update failed", error);
      return NextResponse.json({ error: "db" }, { status: 500 }); // Square retries
    }
  } else if (payment.status === "FAILED" || payment.status === "CANCELED") {
    await db
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("square_order_id", payment.order_id)
      .eq("payment_status", "unpaid");
  }
  return NextResponse.json({ ok: true });
}
