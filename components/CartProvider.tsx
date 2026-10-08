"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine, Product } from "@/lib/types";

export type DetailedLine = {
  key: string;
  slug: string;
  name: string;
  qty: number;
  ginger: boolean;
  unitCents: number;
  gingerCents: number;
  lineCents: number;
};

type CartCtx = {
  ready: boolean;
  count: number;
  lines: CartLine[];
  detailed: DetailedLine[];
  subtotalCents: number;
  add: (slug: string, qty: number, ginger: boolean) => void;
  setQty: (slug: string, ginger: boolean, qty: number) => void;
  setGinger: (slug: string, from: boolean, to: boolean) => void;
  remove: (slug: string, ginger: boolean) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "jbj-cart-v1";
const MAX_QTY = 24;

function sameLine(a: CartLine, slug: string, ginger: boolean) {
  return a.slug === slug && a.ginger === ginger;
}

export function CartProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          setLines(
            parsed.filter(
              (l) => l && typeof l.slug === "string" && Number.isInteger(l.qty) && l.qty > 0 && typeof l.ginger === "boolean"
            )
          );
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines, ready]);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const gingerCents = bySlug.get("ginger")?.price_cents ?? 0;

  const add = useCallback((slug: string, qty: number, ginger: boolean) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => sameLine(l, slug, ginger));
      if (i === -1) return [...prev, { slug, qty: Math.min(qty, MAX_QTY), ginger }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, MAX_QTY) };
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, ginger: boolean, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (sameLine(l, slug, ginger) ? { ...l, qty: Math.min(qty, MAX_QTY) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const setGinger = useCallback((slug: string, from: boolean, to: boolean) => {
    setLines((prev) => {
      const line = prev.find((l) => sameLine(l, slug, from));
      if (!line) return prev;
      const rest = prev.filter((l) => !sameLine(l, slug, from));
      const i = rest.findIndex((l) => sameLine(l, slug, to));
      if (i === -1) return [...rest, { ...line, ginger: to }];
      const next = [...rest];
      next[i] = { ...next[i], qty: Math.min(next[i].qty + line.qty, MAX_QTY) };
      return next;
    });
  }, []);

  const remove = useCallback((slug: string, ginger: boolean) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, slug, ginger)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const detailed = useMemo<DetailedLine[]>(
    () =>
      lines.flatMap((l) => {
        const p = bySlug.get(l.slug);
        if (!p || p.kind !== "juice") return [];
        const g = l.ginger ? gingerCents : 0;
        return [
          {
            key: `${l.slug}:${l.ginger ? "g" : "n"}`,
            slug: l.slug,
            name: p.name,
            qty: l.qty,
            ginger: l.ginger,
            unitCents: p.price_cents,
            gingerCents: g,
            lineCents: (p.price_cents + g) * l.qty,
          },
        ];
      }),
    [lines, bySlug, gingerCents]
  );

  const value = useMemo<CartCtx>(
    () => ({
      ready,
      count: detailed.reduce((n, l) => n + l.qty, 0),
      lines,
      detailed,
      subtotalCents: detailed.reduce((n, l) => n + l.lineCents, 0),
      add,
      setQty,
      setGinger,
      remove,
      clear,
    }),
    [ready, lines, detailed, add, setQty, setGinger, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
