export type Product = {
  id: string;
  slug: string;
  kind: "juice" | "addon";
  name: string;
  tagline: string | null;
  description: string | null;
  ingredients: string | null;
  price_cents: number;
  image_path: string | null;
  sort_order: number;
  active: boolean;
};

export type CartLine = { slug: string; qty: number; ginger: boolean };

export type Fulfillment = "delivery" | "pickup";

export type StoreConfig = {
  deliveryFeeCents: number;
  freeDeliveryMinCents: number;
  taxPercent: number;
};
