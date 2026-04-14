'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export function CartSessionEnforcer() {
  const { status } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);
  
  useEffect(() => {
    // If we definitely know the user is not logged in, clear their local cart.
    // This stops previous sessions from persisting for guests.
    if (status === 'unauthenticated') {
      clearCart();
    }
  }, [status, clearCart]);

  return null;
}
