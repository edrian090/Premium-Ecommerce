'use client';

import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, User, Search, ChevronDown, LogOut, Package, Heart, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CartSessionEnforcer } from './CartSessionEnforcer';

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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-100 shadow-sm">
      <CartSessionEnforcer />
      <div className="container mx-auto flex h-20 items-center px-4 md:px-6 justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 mr-8 group">
          <div className="relative flex items-center justify-center w-8 h-8">
            <ShoppingCart className="w-7 h-7 text-[#003d29]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#003d29]">Shopcart</span>
        </Link>
        
        {/* Middle: Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-[15px] font-semibold text-neutral-700">
          <Link href="/products" className="flex items-center gap-1 hover:text-[#003d29] transition-colors">
            Categories <ChevronDown className="w-4 h-4 ml-0.5 mt-0.5" />
          </Link>
          <Link href="/deals" className="hover:text-[#003d29] transition-colors">Deals</Link>
          <Link href="/new" className="hover:text-[#003d29] transition-colors">What's New</Link>
          <Link href="/delivery" className="hover:text-[#003d29] transition-colors">Delivery</Link>
        </nav>
        
        {/* Right: Search and Actions */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden md:block max-w-[280px] lg:min-w-[320px]">
            <Input 
              type="search" 
              placeholder="Search Product" 
              className="w-full pr-10 pl-5 rounded-full bg-neutral-100 border-none h-11 text-[15px] focus-visible:ring-1 focus-visible:ring-[#003d29] placeholder:text-neutral-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Account */}
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-neutral-800 hover:text-[#003d29] font-medium transition-colors">
                <User className="h-6 w-6 stroke-[1.5]" />
                <span className="hidden sm:inline-block">Account</span>
              </Link>
              
              <Link href="/cart" className="flex items-center gap-2 text-neutral-800 hover:text-[#003d29] font-medium transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#003d29] text-[10px] font-bold text-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline-block">Cart</span>
              </Link>
              
              {/* Additional Logged-in Links (Wishlist, Admin, Logout) */}
              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 ml-2">
                {(session?.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin" title="Admin">
                    <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                      <ShieldAlert className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/wishlist" title="Wishlist">
                  <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-red-500">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/purchases" title="Purchases">
                  <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-[#003d29]">
                    <Package className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => {
                  useCartStore.getState().clearLocalCart();
                  signOut({ callbackUrl: '/' });
                }} className="text-neutral-500 hover:text-neutral-800" title="Log out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 lg:gap-6">
              <Link href="/login" className="flex items-center gap-2 text-neutral-800 hover:text-[#003d29] font-medium transition-colors">
                <User className="h-6 w-6 stroke-[1.5]" />
                <span className="hidden sm:inline-block">Account</span>
              </Link>
              
              <Link href="/cart" className="flex items-center gap-2 text-neutral-800 hover:text-[#003d29] font-medium transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#003d29] text-[10px] font-bold text-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline-block">Cart</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
