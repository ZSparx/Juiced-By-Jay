"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import type { JuiceContent } from "@/lib/content";
import type { Product } from "@/lib/types";
import { usd } from "@/lib/money";

type Props = {
  product: Product;
  content: JuiceContent;
  ginger: Product | null;
  juices: Product[];
};

export function ProductView({ product, content, ginger, juices }: Props) {
  const { add } = useCart();
  const [view, setView] = useState<"bottle" | "poster">("bottle");
  const [qty, setQty] = useState(1);
  const [withGinger, setWithGinger] = useState(false);
  const [added, setAdded] = useState(false);

  const gingerCents = withGinger && ginger ? ginger.price_cents : 0;
  const total = (product.price_cents + gingerCents) * qty;
  const mainSrc = view === "poster" ? content.poster : content.bottle;

  return (
    <section className="product">
      <div className="gallery">
        <div className="gallery-main" style={{ background: content.bg }}>
          <img
            src={mainSrc}
            alt={view === "poster" ? `${product.name} juice info poster` : content.alt}
            style={{ objectFit: view === "poster" ? "contain" : "cover" }}
          />
        </div>
        <div className="thumbs">
          {(
            [
              ["bottle", "Bottle photo", content.bottle],
              ["poster", "Info poster", content.poster],
            ] as const
          ).map(([id, label, src]) => (
            <button
              key={id}
              type="button"
              className="thumb"
              aria-label={label}
              aria-pressed={view === id}
              onClick={() => setView(id)}
              style={{ background: content.bg, borderColor: view === id ? "var(--moss)" : "transparent" }}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="buy">
        <div>
          <div className="cat" style={{ color: content.accent }}>{content.cat}</div>
          <h1>{product.name}</h1>
          <div className="tag">{product.tagline}</div>
        </div>
        <div className="price">{usd(total)}</div>
        <p className="desc">{product.description}</p>

        <div>
          <div className="label">Choose a flavor</div>
          <div className="pills-row">
            {juices.map((j) => (
              <Link key={j.slug} href={`/product/${j.slug}`} className={`pill-btn${j.slug === product.slug ? " on" : ""}`} aria-current={j.slug === product.slug ? "page" : undefined}>
                {j.name}
              </Link>
            ))}
          </div>
        </div>

        {ginger && (
          <label className="option-box">
            <input
              type="checkbox"
              checked={withGinger}
              onChange={(e) => {
                setWithGinger(e.target.checked);
                setAdded(false);
              }}
            />
            <span className="grow">
              <strong>Add ginger</strong>
              <span>Small addition. Big benefits.</span>
            </span>
            <strong>+{usd(ginger.price_cents)}</strong>
          </label>
        )}

        <div className="buy-row">
          <div className="qty">
            <button type="button" aria-label="Decrease quantity" onClick={() => { setQty(Math.max(1, qty - 1)); setAdded(false); }}>−</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => { setQty(Math.min(24, qty + 1)); setAdded(false); }}>+</button>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              add(product.slug, qty, withGinger);
              setAdded(true);
            }}
          >
            {added ? "Added to cart" : `Add to cart · ${usd(total)}`}
          </button>
        </div>
        {added && <Link href="/cart" className="link" style={{ color: "var(--berry)" }}>View your cart →</Link>}

        <div className="assure">
          <span>100% natural</span>
          <span>No added sugar</span>
          <span>No preservatives or additives</span>
          <span>Vegan friendly</span>
        </div>
      </div>
    </section>
  );
}
