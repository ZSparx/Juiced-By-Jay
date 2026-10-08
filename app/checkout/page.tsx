import { CheckoutForm } from "@/components/CheckoutForm";
import { getStoreConfig } from "@/lib/config";

export const metadata = { title: "Checkout | Juiced By Jay" };

export default function CheckoutPage() {
  return (
    <>
      <section className="page-title">
        <h1>Checkout</h1>
      </section>
      <CheckoutForm config={getStoreConfig()} />
    </>
  );
}
