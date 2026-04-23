'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, ChevronUp, ChevronDown, Clock, Tag, Package, Truck, CalendarCheck, XCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  description: string;
  stock: number;
  image: string;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function useCountdown() {
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };
  const [secs, setSecs] = useState(getSecondsUntilMidnight());
  useEffect(() => {
    const t = setInterval(() => setSecs(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

export function ProductDetailsClient({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState('M');
  const [wished, setWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const countdown = useCountdown();
  const isOutOfStock = product.stock <= 0;
  const finalPrice = product.discountPercent > 0
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }
    addItem({ id: product.id, name: product.name, price: finalPrice, image: product.image, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = async () => {
    if (!session) { alert('Please login to save items to your wishlist!'); return; }
    setWishLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) setWished(!wished);
    } finally {
      setWishLoading(false);
    }
  };

  // Estimated arrival: 10 days from now
  const arrival = new Date();
  arrival.setDate(arrival.getDate() + 10);
  const arrivalStr = arrival.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-0">
      {/* Price */}
      <div className="flex items-end gap-3 mb-4">
        <span className="text-2xl font-bold text-neutral-900">${finalPrice.toFixed(2)}</span>
        {product.discountPercent > 0 && (
          <>
            <span className="text-base text-neutral-400 line-through mb-0.5">${product.price.toFixed(2)}</span>
            <span className="text-xs font-bold bg-red-100 text-red-500 px-2 py-1 rounded-full mb-0.5">{product.discountPercent}% OFF</span>
          </>
        )}
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6 border border-neutral-200 rounded-lg px-4 py-3 bg-neutral-50">
        <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        <span>Order in <span className="font-bold text-neutral-900 tabular-nums">{countdown}</span> to get next day delivery</span>
      </div>

      {/* Stock status */}
      {isOutOfStock ? (
        <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-sm">
          <XCircle className="w-4 h-4" /> Out of Stock
        </div>
      ) : product.stock <= 5 ? (
        <div className="mb-5 text-sm text-amber-600 font-medium">⚡ Only {product.stock} left in stock — order soon!</div>
      ) : (
        <div className="mb-5 text-sm text-green-600 font-medium">✓ In Stock ({product.stock} available)</div>
      )}

      {/* Size selector */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-neutral-700 mb-3">Select Size</p>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-12 h-12 rounded-full text-sm font-semibold border transition-all duration-200 ${
                selectedSize === size
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart + Wishlist */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-white transition-all duration-200 ${
            isOutOfStock
              ? 'bg-neutral-300 cursor-not-allowed'
              : added
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-neutral-900 hover:bg-neutral-700'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {isOutOfStock ? 'Out of Stock' : added ? 'Added!' : 'Add to Cart'}
        </button>
        <button
          onClick={toggleWishlist}
          disabled={wishLoading}
          className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-200 ${
            wished
              ? 'bg-red-50 border-red-300 text-red-500'
              : 'bg-white border-neutral-300 text-neutral-500 hover:border-neutral-400'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-5 h-5 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Description & Fit accordion */}
      <Accordion title="Description & Fit" defaultOpen={true}>
        <p className="text-sm text-neutral-600 leading-relaxed">{product.description}</p>
      </Accordion>

      {/* Shipping accordion */}
      <Accordion title="Shipping" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-full bg-neutral-100">
              <Tag className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Discount</p>
              <p className="text-sm font-semibold text-neutral-900">
                {product.discountPercent > 0 ? `${product.discountPercent}%` : 'No discount'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-full bg-neutral-100">
              <Package className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Package</p>
              <p className="text-sm font-semibold text-neutral-900">Regular Package</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-full bg-neutral-100">
              <Truck className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Delivery Time</p>
              <p className="text-sm font-semibold text-neutral-900">3–4 Working Days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-full bg-neutral-100">
              <CalendarCheck className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Estimated Arrival</p>
              <p className="text-sm font-semibold text-neutral-900">{arrivalStr}</p>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
}
