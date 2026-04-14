'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  stock: number;
}

export function AddToCartButton({ product, stock }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    addItem({ ...product, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isOutOfStock) {
    return (
      <Button 
        size="lg" 
        disabled
        className="w-full md:w-auto h-14 px-8 text-lg bg-neutral-400 text-white cursor-not-allowed"
      >
        <XCircle className="mr-2 h-5 w-5" />
        Out of Stock
      </Button>
    );
  }

  return (
    <Button 
      size="lg" 
      onClick={handleAddToCart}
      className={`w-full md:w-auto h-14 px-8 text-lg ${added ? 'bg-green-600 hover:bg-green-700' : 'bg-[#E94560] hover:bg-[#c8354c]'} text-white transition-all`}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {added ? 'Added to Cart' : 'Add to Cart'}
    </Button>
  );
}
