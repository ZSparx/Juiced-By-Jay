import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export const metadata = { title: "Shop all juices | Juiced By Jay" };

export default async function ShopPage() {
  const products = await getProducts();
  const juices = products.filter((p) => p.kind === "juice").length;
  const addons = products.length - juices;

  return (
    <>
      <section className="page-title">
        <div style={{ fontSize: 14, color: "var(--muted)" }}>
          <Link href="/">Home</Link> / Shop
        </div>
        <h1>Shop all juices</h1>
        <p>Cold-pressed with real fruit and greens. All juices $8. Add ginger to either bottle.</p>
      </section>
      <section className="section" style={{ padding: "28px var(--pad) 32px", fontSize: 15, color: "var(--muted)" }}>
        {juices} juice{juices === 1 ? "" : "s"} · {addons} add-on{addons === 1 ? "" : "s"}
      </section>
      <section className="section" style={{ paddingBottom: 96 }}>
        <div className="grid-cards">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
