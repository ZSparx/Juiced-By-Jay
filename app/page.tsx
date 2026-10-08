import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import { GINGER } from "@/lib/content";

const TRUST: { label: string; path: string }[] = [
  { label: "100% natural", path: "M5 19C4 11 9 5 19 4c1 9-4 15-14 15zM5 19L14 10" },
  { label: "No added sugar", path: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM6 6l12 12" },
  { label: "No preservatives or additives", path: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" },
  { label: "Vegan friendly", path: "M5 19C4 11 9 5 19 4c1 9-4 15-14 15zM5 19L14 10" },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Cold-pressed · 100% natural · Vegan friendly</span>
          <h1>
            Nourish your body. <span style={{ color: "var(--berry)" }}>Elevate your day.</span>
          </h1>
          <p>
            Two cold-pressed juices made with real goodness: Citrus Beet and Green Power, $8 each. Add a little ginger
            and take it up a notch.
          </p>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-primary">Shop juices</Link>
            <Link href="/product/citrus-beet" className="btn btn-ink">Add ginger</Link>
          </div>
        </div>
        <div className="hero-photo">
          <img src={GINGER.image} alt={GINGER.alt} />
          <div className="price-badge"><span>ALL JUICES</span><span>$8</span></div>
        </div>
      </section>

      <section className="trust">
        {TRUST.map((t) => (
          <div key={t.label}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.path} />
            </svg>
            <span>{t.label}</span>
          </div>
        ))}
      </section>

      <section className="section" style={{ padding: "88px var(--pad) 40px" }}>
        <div className="sec-head">
          <h2>Our juices</h2>
          <Link href="/shop" className="link">Shop all →</Link>
        </div>
        <div className="grid-cards">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="ginger-band">
        <div className="left">
          <div className="kicker">SMALL ADDITION. BIG BENEFITS.</div>
          <h2>Add ginger, elevate your juice.</h2>
          <p>Adding ginger to either of our pressed juices takes the flavor, and the benefits, to the next level.</p>
          <Link href="/product/citrus-beet" className="btn">Add ginger to your order</Link>
        </div>
        <div className="pills">
          <div className="pill">Supports immune health</div>
          <div className="pill">Aids digestion</div>
          <div className="pill">Boosts energy and focus</div>
        </div>
      </section>

      <section className="section" style={{ padding: "24px var(--pad) 88px" }}>
        <h2 style={{ fontSize: 40, marginBottom: 32 }}>Shop by what you need</h2>
        <div className="needs">
          <Link href="/shop" className="need" style={{ background: "#e4ebcf" }}>
            <span className="serif">Immune support</span>
            <span>Vitamin C and antioxidants from citrus, spinach and lemon, with ginger on top.</span>
          </Link>
          <Link href="/shop" className="need" style={{ background: "#f6e3c2" }}>
            <span className="serif">Natural energy</span>
            <span>Quick, clean energy for a pre-workout boost or an afternoon pick-me-up.</span>
          </Link>
          <Link href="/shop" className="need" style={{ background: "#ebd3d9" }}>
            <span className="serif">Hydration</span>
            <span>Cucumber, green apple and citrus to keep you refreshed through the day.</span>
          </Link>
        </div>
      </section>
    </>
  );
}
