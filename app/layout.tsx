import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { AnnounceBar, Footer, Header } from "@/components/SiteChrome";
import { getProducts } from "@/lib/products";
import { getStoreConfig } from "@/lib/config";
import { usd } from "@/lib/money";

// Products come from the database on every request so price changes show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Juiced By Jay | Cold-pressed juice",
  description: "100% natural cold-pressed juice. Citrus Beet and Green Power, $8 each. Add ginger for a little extra goodness.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await getProducts();
  const cfg = getStoreConfig();
  const freeText = cfg.freeDeliveryMinCents > 0 ? `Free local delivery over ${usd(cfg.freeDeliveryMinCents)}` : null;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Young+Serif&family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider products={products}>
          <AnnounceBar freeDeliveryText={freeText} />
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
