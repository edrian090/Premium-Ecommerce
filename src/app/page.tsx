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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">Featured Products</h2>
            <Link href="/products" className="text-[#0F3460] font-semibold hover:underline">
              View all products →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => {
              const images = JSON.parse(product.images || '[]');
              return (
              <Card key={product.id} className={`group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-[#F5F5F5] ${product.stock <= 0 ? 'opacity-80' : ''}`}>
                <div className="relative aspect-square overflow-hidden bg-white">
                  <Image 
                    src={images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name} 
                    fill 
                    className={`object-cover transition-transform duration-500 ${product.stock <= 0 ? 'grayscale' : 'group-hover:scale-110'}`} 
                  />
                  {product.stock <= 0 ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <span className="bg-red-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg tracking-wide">
                        OUT OF STOCK
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-[#E94560] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                      SALE
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                      Only {product.stock} left
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-[#1A1A2E] mb-2 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 md:mb-4">{product.description}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#E94560]">${product.price.toFixed(2)}</span>
                  <Link href={`/product/${product.id}`}>
                    <Button variant="outline" className="border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-colors">
                      Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
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
