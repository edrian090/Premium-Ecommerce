'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-[#1A1A2E] mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-500 mb-8 max-w-lg">
        Thank you for your order. We are processing it and will send you a confirmation email shortly.
      </p>
      
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="bg-[#0F3460] hover:bg-[#1A1A2E] text-white">
            View Order
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" variant="outline">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
