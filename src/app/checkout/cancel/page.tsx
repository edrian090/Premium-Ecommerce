import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-[#1A1A2E] mb-4">Checkout Canceled</h1>
      <p className="text-lg text-gray-500 mb-8 max-w-lg">
        Your payment was canceled. No charges were made. You can try checking out again or continue shopping.
      </p>
      
      <div className="flex gap-4">
        <Link href="/checkout">
          <Button size="lg" className="bg-[#0F3460] hover:bg-[#1A1A2E] text-white">
            Try Again
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
