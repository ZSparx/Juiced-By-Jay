import Link from "next/link";
import type { Product } from "@/lib/types";
import { GINGER, JUICE_CONTENT } from "@/lib/content";
import { usd } from "@/lib/money";

export function ProductCard({ product }: { product: Product }) {
  const isAddon = product.kind === "addon";
  const content = JUICE_CONTENT[product.slug];
  const img = isAddon ? GINGER.image : content?.bottle;
  const bg = isAddon ? GINGER.bg : content?.bg ?? "#EEE6CF";
  const alt = isAddon ? GINGER.alt : content?.alt ?? product.name;
  const href = isAddon ? "/product/citrus-beet" : `/product/${product.slug}`;
  const note = isAddon ? "To either juice · Small addition. Big benefits." : product.ingredients?.replaceAll(", ", " · ");

  return (
    <Link href={href} className="card">
      <div className="card-img" style={{ background: bg }}>
        {img && <img src={img} alt={alt} loading="lazy" />}
        {isAddon && <span className="chip">Add-on</span>}
      </div>
      <div className="card-row">
        <div>
          <div className="card-name">{product.name}</div>
          <div className="card-note">{note}</div>
        </div>
        <span className="card-name">{isAddon ? "+" : ""}{usd(product.price_cents)}</span>
      </div>
      <span className="btn btn-outline" style={{ height: 46 }}>View details</span>
    </Link>
  );
}
