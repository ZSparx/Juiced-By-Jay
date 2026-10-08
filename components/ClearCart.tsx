"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

// Square only returns shoppers here after a completed checkout, so the cart can be emptied.
export function ClearCart() {
  const { ready, clear } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
