"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { INSTAGRAM_URL } from "@/lib/content";

function LeafIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 19C4 11 9 5 19 4c1 9-4 15-14 15z" />
      <path d="M5 19L14 10" />
    </svg>
  );
}

export function AnnounceBar({ freeDeliveryText }: { freeDeliveryText: string | null }) {
  return (
    <div className="announce">
      100% natural, cold-pressed juice{freeDeliveryText ? ` · ${freeDeliveryText}` : ""}
    </div>
  );
}

export function Header() {
  const { count } = useCart();
  const path = usePathname();
  const active = path === "/" ? "home" : path.startsWith("/shop") || path.startsWith("/product") ? "shop" : "";
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span style={{ color: "var(--moss)", display: "flex" }}>
          <LeafIcon />
        </span>
        <span className="serif">Juiced By Jay</span>
      </Link>
      <nav className="nav" aria-label="Main">
        <Link href="/" className={active === "home" ? "active" : ""}>Home</Link>
        <Link href="/shop" className={active === "shop" ? "active" : ""}>Shop</Link>
      </nav>
      <Link href="/cart" className="cart-pill" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 8h14l-1 12H6z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
        Cart ({count})
      </Link>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="serif" style={{ fontSize: 26, marginBottom: 14 }}>Juiced By Jay</div>
          <p>Pure. Potent. Powerful. A little ginger, a lot of goodness.</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>@juicedbyjay</a>
        </div>
        <div className="footer-col">
          <strong>Shop</strong>
          <Link href="/shop">All juices</Link>
          <Link href="/product/citrus-beet">Citrus Beet</Link>
          <Link href="/product/green-power">Green Power</Link>
        </div>
      </div>
      <div className="footer-bottom">© Juiced By Jay. All rights reserved.</div>
    </footer>
  );
}
