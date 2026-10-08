import { supabasePublic } from "./supabase";
import type { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabasePublic()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabasePublic()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  return (data as Product | null) ?? null;
}
