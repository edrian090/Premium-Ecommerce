import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import Image from 'next/image';

export default async function Home() {
  // Let's fetch some products from the database later.
  // For now, since the DB is empty, let's use some placeholder data to scaffold the UI.
  
  // Fetch products from database
  const featuredProducts = await prisma.product.findMany({
    take: 4,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-[#1A1A2E] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Elevate Your <span className="text-[#E94560]">Lifestyle</span>
          </h1>
          <p className="max-w-[600px] text-lg text-gray-300 mb-8 font-medium">
            Discover a curated collection of premium electronics, fashion, and accessories designed for modern living.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-[#E94560] hover:bg-[#c8354c] text-white px-8 py-6 text-lg rounded-full font-bold shadow-[0_0_15px_rgba(233,69,96,0.4)] transition-all hover:scale-105">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-neutral-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12 border-b border-neutral-100 pb-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Featured Products</h2>
            <Link href="/products" className="text-sm font-semibold text-[#003d29] hover:underline transition-all">
              View all products →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {featuredProducts.map((product) => {
              const images = JSON.parse(product.images || '[]');
              return (
              <div key={product.id} className="group flex flex-col">
                <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-neutral-100 rounded-2xl mb-4">
                  <Image 
                    src={images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name} 
                    fill 
                    className={`object-cover transition-transform duration-700 ${product.stock <= 0 ? 'grayscale' : 'group-hover:scale-105'}`} 
                  />
                  {product.stock <= 0 ? (
                    <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2 text-center border-t border-neutral-200">
                      <span className="text-neutral-800 text-xs font-bold tracking-widest uppercase">
                        Out of Stock
                      </span>
                    </div>
                  ) : product.discountPercent > 0 ? (
                    <div className="absolute top-3 left-3 bg-white text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      -{product.discountPercent}%
                    </div>
                  ) : null}
                </Link>
                <div className="flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-[15px] leading-snug text-neutral-900 group-hover:text-[#003d29] transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex flex-col items-end text-right shrink-0">
                      {product.discountPercent > 0 ? (
                        <>
                          <span className="font-bold text-neutral-900">${(product.price * (1 - product.discountPercent / 100)).toFixed(2)}</span>
                          <span className="text-xs font-semibold text-neutral-400 line-through">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="font-bold text-neutral-900">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1 mt-1 mb-4">{product.description}</p>
                  <Button variant="outline" className="w-full mt-auto rounded-full border-neutral-200 text-neutral-800 hover:bg-[#003d29] hover:text-white hover:border-[#003d29] transition-all font-semibold h-10 text-[13px]">
                    <Link href={`/product/${product.id}`} className="w-full text-center">View Product</Link>
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="bg-[#0F3460] text-white py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-gray-400">© 2026 Storefront. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
