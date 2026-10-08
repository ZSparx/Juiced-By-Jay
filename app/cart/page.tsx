"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { JUICE_CONTENT } from "@/lib/content";
import { usd } from "@/lib/money";

export default function CartPage() {
  const { ready, detailed, subtotalCents, setQty, setGinger, remove } = useCart();

  return (
    <>
      <section className="page-title">
        <h1>Your cart</h1>
      </section>

      {!ready ? (
        <section className="section" style={{ padding: "24px var(--pad) 96px" }}>Loading your cart…</section>
      ) : detailed.length === 0 ? (
        <section className="section empty" style={{ padding: "24px var(--pad) 96px" }}>
          <h2 style={{ fontSize: 30 }}>Your cart is empty</h2>
          <p>Pick a juice to get started.</p>
          <Link href="/shop" className="btn btn-primary">Shop juices</Link>
        </section>
      ) : (
        <section className="cart-wrap">
          <div className="cart-lines">
            {detailed.map((l) => {
              const c = JUICE_CONTENT[l.slug];
              return (
                <div className="line" key={l.key}>
                  <div className="line-img" style={{ background: c?.bg }}>
                    {c && <img src={c.bottle} alt={`${l.name} bottle`} />}
                  </div>
                  <div className="line-info">
                    <div className="n">{l.name}</div>
                    <div className="s">
                      {usd(l.unitCents)} each · {l.ginger ? `Add ginger (+${usd(l.gingerCents)})` : "No ginger"}
                    </div>
                    <div className="line-actions">
                      <button type="button" className="linkbtn moss" onClick={() => setGinger(l.slug, l.ginger, !l.ginger)}>
                        {l.ginger ? "Remove ginger" : "Add ginger"}
                      </button>
                      <button type="button" className="linkbtn" onClick={() => remove(l.slug, l.ginger)}>Remove</button>
                    </div>
                  </div>
                  <div className="qty">
                    <button type="button" aria-label={`Decrease ${l.name} quantity`} onClick={() => setQty(l.slug, l.ginger, l.qty - 1)}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" aria-label={`Increase ${l.name} quantity`} onClick={() => setQty(l.slug, l.ginger, l.qty + 1)}>+</button>
                  </div>
                  <div className="line-total">{usd(l.lineCents)}</div>
                </div>
              );
            })}
            <Link href="/shop" className="link" style={{ marginTop: 28 }}>← Continue shopping</Link>
          </div>

          <aside className="summary">
            <h2>Order summary</h2>
            <div className="sum-row"><span className="k">Subtotal</span><strong>{usd(subtotalCents)}</strong></div>
            <div className="sum-row"><span className="k">Delivery and tax</span><span>Calculated at checkout</span></div>
            <Link href="/checkout" className="btn btn-primary" style={{ height: 56, fontSize: 17 }}>Checkout</Link>
            <div className="note">Secure payment by Square</div>
          </aside>
        </section>
      )}
    </>
  );
}
