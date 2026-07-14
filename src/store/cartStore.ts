/* ============================================================================
   BESTIES — Cart store (Nanostores, ultraleve, sem framework)
   - cartOpen: gaveta aberta/fechada (liga no data-cart-open do Header)
   - cartItems: itens PERSISTIDOS no localStorage (sobrevive a reload)
   - computed: cartCount (qtd total) e cartSubtotal (em centavos)
   Preços sempre em CENTAVOS (int) — dinheiro nunca em float.
   ============================================================================ */
import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  id: string;
  name: string;
  priceCents: number;
  image: string;
  qty: number;
}

export type CartItems = Record<string, CartItem>;

/* --- Abertura da gaveta ---------------------------------------------------- */
export const cartOpen = atom<boolean>(false);

export const openCart = () => cartOpen.set(true);
export const closeCart = () => cartOpen.set(false);
export const toggleCart = () => cartOpen.set(!cartOpen.get());

/* --- Itens (persistidos) --------------------------------------------------- */
export const cartItems = persistentAtom<CartItems>('besties:cart', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/** Adiciona (ou incrementa) um item. Silencioso: NÃO abre a gaveta,
 *  apenas atualiza o estado (o badge do header reage ao cartCount). */
export function addItem(item: Omit<CartItem, 'qty'>, qty = 1): void {
  const items = { ...cartItems.get() };
  const existing = items[item.id];
  items[item.id] = existing
    ? { ...existing, qty: existing.qty + qty }
    : { ...item, qty };
  cartItems.set(items);
}

/** Define a quantidade exata (remove se <= 0). */
export function setQty(id: string, qty: number): void {
  const items = { ...cartItems.get() };
  if (!items[id]) return;
  if (qty <= 0) {
    delete items[id];
  } else {
    items[id] = { ...items[id], qty };
  }
  cartItems.set(items);
}

/** +1 / -1 conveniências. */
export const increment = (id: string) => {
  const it = cartItems.get()[id];
  if (it) setQty(id, it.qty + 1);
};
export const decrement = (id: string) => {
  const it = cartItems.get()[id];
  if (it) setQty(id, it.qty - 1);
};

export function removeItem(id: string): void {
  setQty(id, 0);
}

export function clearCart(): void {
  cartItems.set({});
}

/* --- Derivados ------------------------------------------------------------- */
export const cartCount = computed(cartItems, (items) =>
  Object.values(items).reduce((n, i) => n + i.qty, 0)
);

export const cartSubtotal = computed(cartItems, (items) =>
  Object.values(items).reduce((n, i) => n + i.priceCents * i.qty, 0)
);