'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';

export function CartSessionEnforcer() {
  const { status } = useSession();
  const { clearLocalCart, setCart, items, _hasHydrated } = useCartStore();
  const hasSynced = useRef(false);
  const previousStatus = useRef(status);

  useEffect(() => {
    // Wait for Zustand to finish loading state from localStorage
    if (!_hasHydrated) return;

    if (status === 'authenticated' && !hasSynced.current) {
      hasSynced.current = true;

      // Merge current localStorage items into the DB cart, then restore the full cart
      const localItems = items.map((i) => ({ id: i.id, quantity: i.quantity }));

      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localItems }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            setCart(data.items);
          }
        })
        .catch(() => {
          // Network error — leave local cart as-is
        });
    }

    // Only clear the cart if transitioning from 'authenticated' -> 'unauthenticated'
    // This prevents wiping a guest's cart upon simple page refreshes
    if (status === 'unauthenticated' && previousStatus.current === 'authenticated') {
      // Reset sync flag so next login triggers a fresh sync
      hasSynced.current = false;
      clearLocalCart();
    }

    previousStatus.current = status;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, _hasHydrated]);

  return null;
}
