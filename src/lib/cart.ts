import { useEffect, useState } from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: string;
  image: string | null;
  qty: number;
};

const KEY = "im_cart_v1";
const EVT = "im_cart_change";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const items = read();
  const found = items.find((i) => i.slug === item.slug);
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  write(items);
}

export function removeFromCart(slug: string) {
  write(read().filter((i) => i.slug !== slug));
}

export function updateQty(slug: string, qty: number) {
  const items = read();
  const it = items.find((i) => i.slug === slug);
  if (!it) return;
  it.qty = Math.max(1, qty);
  write(items);
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return items;
}

export function buildQuoteMessage(
  items: CartItem[],
  opts?: { coupon?: { codigo: string; descricao?: string | null }; subtotalLabel?: string; descontoLabel?: string; totalLabel?: string }
) {
  const lines = items.map(
    (i, idx) => `${idx + 1}. ${i.name} — ${i.qty}x — ${i.price}`
  );
  let msg = `Olá! Gostaria de um orçamento para os seguintes produtos:\n\n${lines.join("\n")}`;
  if (opts?.subtotalLabel) msg += `\n\nSubtotal: ${opts.subtotalLabel}`;
  if (opts?.coupon) {
    msg += `\nCupom: ${opts.coupon.codigo}`;
    if (opts.coupon.descricao) msg += ` (${opts.coupon.descricao})`;
    if (opts?.descontoLabel) msg += `\nDesconto: -${opts.descontoLabel}`;
    if (opts?.totalLabel) msg += `\nTotal com cupom: ${opts.totalLabel}`;
    msg += `\n\n(Vendedor confirma a aplicação do cupom.)`;
  }
  return msg;
}
