import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearLocalCart: () => void;
  setCart: (items: CartItem[]) => void;
  getCartTotal: () => number;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setCart: (items) => set({ items }),

      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        let newItems: CartItem[];

        if (existingItem) {
          newItems = currentItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...currentItems, { ...item, quantity: 1 }];
        }

        set({ items: newItems });

        // Persist to DB (fire-and-forget for authenticated users)
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.id, quantity: existingItem ? existingItem.quantity + 1 : 1 }),
        }).catch(() => {/* guest user — ignore */});
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });

        fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        }).catch(() => {/* guest user — ignore */});
      },

      updateQuantity: (id, quantity) => {
        const safeQty = Math.max(1, quantity);
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: safeQty } : i
          ),
        });

        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id, quantity: safeQty }),
        }).catch(() => {/* guest user — ignore */});
      },

      // clearLocalCart: used on LOGOUT — clears localStorage only, preserves DB cart
      clearLocalCart: () => set({ items: [] }),

      // clearCart: used after CHECKOUT — clears both localStorage and DB
      clearCart: () => {
        set({ items: [] });
        fetch('/api/cart', { method: 'PUT' }).catch(() => {});
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce-cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
