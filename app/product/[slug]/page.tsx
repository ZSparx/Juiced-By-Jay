import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductView } from "@/components/ProductView";
import { GINGER, JUICE_CONTENT } from "@/lib/content";
import { getProduct, getProducts } from "@/lib/products";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return { title: p ? `${p.name} | Juiced By Jay` : "Juiced By Jay" };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProduct(slug), getProducts()]);
  const content = JUICE_CONTENT[slug];
  // Only juices have a product page; ginger is an add-on picked on a juice page.
  if (!product || product.kind !== "juice" || !content) notFound();

  const juices = all.filter((p) => p.kind === "juice");
  const ginger = all.find((p) => p.kind === "addon" && p.slug === "ginger") ?? null;
  const other = juices.find((j) => j.slug !== slug);
  const otherContent = other ? JUICE_CONTENT[other.slug] : undefined;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {product.name}
      </div>

      <ProductView product={product} content={content} ginger={ginger} juices={juices} />

      <section className="info-cards">
        <div className="info-card">
          <h2>Made with real goodness</h2>
          <div className="stack">
            {content.ingredients.map((i) => (
              <div key={i.name}>
                <strong style={{ color: content.accent }}>{i.name}</strong>
                <div>{i.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="info-card">
          <h2>Benefits</h2>
          <div className="stack">
            {content.benefits.map((b) => (
              <div key={b.name}>
                <strong style={{ color: content.accent }}>{b.name}</strong>
                <div>{b.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="info-card">
          <h2>Why add ginger</h2>
          <p style={{ marginBottom: 20, lineHeight: 1.6, color: "var(--muted)" }}>
            Small addition. Big benefits. A little ginger, a lot of goodness.
          </p>
          <div className="stack">
            {GINGER.benefits.map((g) => (
              <div key={g.name}>
                <strong style={{ color: "var(--moss)" }}>{g.name}</strong>
                <div>{g.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {other && otherContent && (
        <section className="section" style={{ paddingBottom: 96 }}>
          <h2 style={{ fontSize: 36, marginBottom: 32 }}>Try the other flavor</h2>
          <Link href={`/product/${other.slug}`} className="other">
            <div className="thumb-lg" style={{ background: otherContent.bg }}>
              <img src={otherContent.bottle} alt={otherContent.alt} loading="lazy" />
            </div>
            <div className="txt">
              <strong style={{ fontSize: 22 }}>{other.name}</strong>
              <span style={{ color: "var(--muted)", lineHeight: 1.5 }}>{other.tagline}</span>
              <strong style={{ fontSize: 20 }}>${(other.price_cents / 100).toFixed(2)}</strong>
              <span className="link">View this flavor →</span>
            </div>
          </Link>
        </section>
      )}
    </>
  );
}
