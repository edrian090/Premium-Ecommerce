'use client';

import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, User, LogOut, Search, ShieldAlert, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white border-neutral-200">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight text-neutral-900">Storefront</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/products" className="transition-colors hover:text-neutral-900 text-neutral-500">Products</Link>
        </nav>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto ml-8 relative hidden md:block">
          <Input 
            type="search" 
            placeholder="Search all products..." 
            className="w-full pl-9 bg-neutral-50 border-neutral-200 focus-visible:ring-[#0F3460]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        </form>

        <div className="flex items-center space-x-4 ml-auto">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              {(session?.user as any)?.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold flex items-center gap-2 hidden sm:flex">
                    <ShieldAlert className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/purchases">
                <Button variant="ghost" size="icon" className="text-[#0F3460] hover:text-[#1A1A2E] hover:bg-blue-50">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => {
                useCartStore.getState().clearCart();
                signOut({ callbackUrl: '/' });
              }}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => signIn()} className="text-neutral-600 hover:text-neutral-900 hidden sm:inline-flex">
                Log in
              </Button>
              <Link href="/register">
                <Button variant="default" className="bg-[#0F3460] hover:bg-[#1A1A2E] text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
