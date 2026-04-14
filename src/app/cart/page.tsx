'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const total = getCartTotal();

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingCartIcon className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Please log in to use the Cart</h2>
        <p className="text-gray-500 mb-8 max-w-md">You must be logged in to view your cart items or add new products.</p>
        <Link href={`/login?callbackUrl=${encodeURIComponent('/cart')}`}>
          <Button size="lg" className="bg-[#0F3460] hover:bg-[#1A1A2E] text-white px-10">Log In</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingCartIcon className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven&apos;t added any products to your cart yet. Discover our premium collection!</p>
        <Link href="/">
          <Button size="lg" className="bg-[#E94560] hover:bg-[#c8354c] text-white">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-10">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 lg:col-span-2 shadow-sm rounded-xl overflow-hidden bg-white border border-neutral-100">
          <ul className="divide-y divide-neutral-100">
            {items.map((item) => (
              <li key={item.id} className="flex p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                
                <div className="ml-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-neutral-900">{item.name}</h3>
                      <p className="text-lg font-bold text-[#1A1A2E]">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-3 bg-white border border-neutral-200 rounded-md p-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-black" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-black" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <p className="text-gray-500">Subtotal</p>
                <p className="font-medium text-neutral-900">${total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Shipping (Flat Rate)</p>
                <p className="font-medium text-neutral-900">$10.00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Tax</p>
                <p className="font-medium text-neutral-900">${(total * 0.08).toFixed(2)}</p>
              </div>
              
              <div className="pt-4 border-t border-neutral-200 flex justify-between">
                <p className="text-lg font-bold text-[#1A1A2E]">Total</p>
                <p className="text-lg font-bold text-[#E94560]">${(total + 10 + total * 0.08).toFixed(2)}</p>
              </div>
            </div>
            
            <Link href="/checkout" className="block w-full">
              <Button size="lg" className="w-full bg-[#E94560] hover:bg-[#c8354c] text-white">
                Proceed to Checkout
              </Button>
            </Link>
            
            <Button variant="ghost" className="w-full mt-4 text-neutral-500" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
