'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function WishlistButton({ productId, initialWished = false, refreshOnUpdate = false }: { productId: string, initialWished?: boolean, refreshOnUpdate?: boolean }) {
  const { data: session } = useSession();
  const [isWished, setIsWished] = useState(initialWished);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleWishlist = async () => {
    if (!session) {
      alert('Please login to save items to your wishlist!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        setIsWished(!isWished);
        if (refreshOnUpdate) {
          router.refresh();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleWishlist} 
      disabled={loading}
      className={`border-[#E94560] ${isWished ? 'bg-[#E94560] text-white' : 'text-[#E94560] hover:bg-red-50'}`}
    >
      <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
    </Button>
  );
}
