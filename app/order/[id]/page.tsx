import Link from "next/link";
import { ClearCart } from "@/components/ClearCart";
import { usd } from "@/lib/money";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = { title: "Order confirmation | Juiced By Jay" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Order = {
  order_number: number;
  customer_name: string;
  fulfillment: string;
  payment_status: string;
  total_cents: number;
  order_items: { name: string; quantity: number; ginger: boolean; line_total_cents: number }[];
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order: Order | null = null;
  if (UUID.test(id)) {
    try {
      const { data } = await supabaseAdmin()
        .from("orders")
        .select("order_number, customer_name, fulfillment, payment_status, total_cents, order_items(name, quantity, ginger, line_total_cents)")
        .eq("id", id)
        .maybeSingle();
      order = (data as Order | null) ?? null;
    } catch (e) {
      console.error("order lookup failed", e);
    }
  }

  const paid = order?.payment_status === "paid";

  return (
    <div className="status-card">
      <ClearCart />
      <h1>{paid ? "Thank you!" : "Thanks for your order"}</h1>
      {order && <p style={{ fontWeight: 700, color: "var(--ink)" }}>Order #{order.order_number}</p>}
      <p>
        {paid
          ? "Your payment is confirmed. We'll start on your juice right away and email you a receipt."
          : "We're confirming your payment with Square. Your receipt will arrive by email, and this page updates once it clears."}
      </p>
      {order && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {order.order_items.map((i, n) => (
            <div className="sum-row" key={n}>
              <span>{i.quantity} × {i.name}{i.ginger ? " + ginger" : ""}</span>
              <strong>{usd(i.line_total_cents)}</strong>
            </div>
          ))}
          <div className="sum-row sum-total"><span>Total</span><span>{usd(order.total_cents)}</span></div>
          <p>{order.fulfillment === "pickup" ? "Pickup order" : "Local delivery"}</p>
        </div>
      )}
      <Link href="/shop" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Keep shopping</Link>
    </div>
  );
}
