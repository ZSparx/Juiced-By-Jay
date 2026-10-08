"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { computeTotals } from "@/lib/pricing-core";
import { usd } from "@/lib/money";
import type { Fulfillment, StoreConfig } from "@/lib/types";

export function CheckoutForm({ config }: { config: StoreConfig }) {
  const { ready, detailed, lines, subtotalCents } = useCart();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = computeTotals(subtotalCents, fulfillment, config);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines,
          fulfillment,
          customer: { name: get("name"), email: get("email"), phone: get("phone") },
          address: {
            line1: get("line1"),
            line2: get("line2"),
            city: get("city"),
            state: get("state"),
            postalCode: get("postalCode"),
          },
          notes: get("notes"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong. Please try again.");
      window.location.href = data.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (!ready) return <section className="section" style={{ padding: "24px var(--pad) 96px" }}>Loading…</section>;

  if (detailed.length === 0) {
    return (
      <section className="section empty" style={{ padding: "24px var(--pad) 96px" }}>
        <h2 style={{ fontSize: 30 }}>Your cart is empty</h2>
        <p>Add a juice before checking out.</p>
        <Link href="/shop" className="btn btn-primary">Shop juices</Link>
      </section>
    );
  }

  const delivery = fulfillment === "delivery";

  return (
    <div className="cart-wrap">
      <form className="form" onSubmit={onSubmit}>
        <fieldset className="fieldset">
          <legend>Your details</legend>
          <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" /></div>
          <div className="two">
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required autoComplete="tel" /></div>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Delivery or pickup</legend>
          <div className="radios">
            <label className="radio"><input type="radio" name="fulfillment" checked={delivery} onChange={() => setFulfillment("delivery")} />Local delivery</label>
            <label className="radio"><input type="radio" name="fulfillment" checked={!delivery} onChange={() => setFulfillment("pickup")} />Pickup</label>
          </div>
          {delivery && (
            <>
              <div className="field"><label htmlFor="line1">Street address</label><input id="line1" name="line1" required autoComplete="address-line1" /></div>
              <div className="field"><label htmlFor="line2">Apt, suite (optional)</label><input id="line2" name="line2" autoComplete="address-line2" /></div>
              <div className="two">
                <div className="field"><label htmlFor="city">City</label><input id="city" name="city" required autoComplete="address-level2" /></div>
                <div className="field"><label htmlFor="state">State</label><input id="state" name="state" required maxLength={2} defaultValue="TX" autoComplete="address-level1" /></div>
                <div className="field"><label htmlFor="postalCode">ZIP code</label><input id="postalCode" name="postalCode" required inputMode="numeric" autoComplete="postal-code" /></div>
              </div>
            </>
          )}
          <div className="field"><label htmlFor="notes">Notes (optional)</label><textarea id="notes" name="notes" placeholder={delivery ? "Gate code, leave at door, etc." : "Anything we should know?"} /></div>
        </fieldset>

        {error && <div className="error" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ height: 56, fontSize: 17 }}>
          {busy ? "Taking you to secure payment…" : `Continue to payment · ${usd(totals.totalCents)}`}
        </button>
      </form>

      <aside className="summary">
        <h2>Order summary</h2>
        {detailed.map((l) => (
          <div className="sum-row" key={l.key}>
            <span>{l.qty} × {l.name}{l.ginger ? " + ginger" : ""}</span>
            <strong>{usd(l.lineCents)}</strong>
          </div>
        ))}
        <div className="sum-row sum-total" style={{ borderTop: "1px solid var(--line)", paddingTop: 20, fontSize: 16, fontWeight: 400 }}>
          <span className="k">Subtotal</span><span>{usd(totals.subtotalCents)}</span>
        </div>
        <div className="sum-row"><span className="k">Delivery</span><span>{delivery ? (totals.deliveryFeeCents ? usd(totals.deliveryFeeCents) : "Free") : "Pickup"}</span></div>
        {config.taxPercent > 0 && <div className="sum-row"><span className="k">Tax</span><span>{usd(totals.taxCents)}</span></div>}
        <div className="sum-row sum-total"><span>Total</span><span>{usd(totals.totalCents)}</span></div>
        <div className="note">You'll pay on Square's secure checkout page.</div>
      </aside>
    </div>
  );
}
