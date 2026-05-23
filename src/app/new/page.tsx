import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarDays, ArrowRight } from "lucide-react";
import { parseImages } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function NewArrivalsPage() {
  // Query recently added clothing products (up to 12)
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 12,
    include: {
      category: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAFC]">
      {/* Editorial Header Section */}
      <section className="bg-white border-b border-neutral-100 py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#003d29]/5 text-[#003d29] text-xs font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#003d29] animate-spin" />
            <span>Just Dropped</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A2E] tracking-tight mb-4">
            The New Arrivals
          </h1>
          <p className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Fresh styles, premium cuts, and all-new seasonal essentials. Discover our newest clothing collection, queried in real-time from the database.
          </p>

          {/* Mini active badge */}
          <div className="flex items-center justify-center gap-2 mt-8 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>Real-time Live Feed Active</span>
          </div>
        </div>
      </section>

      {/* Main Products Grid */}
      <main className="container mx-auto px-4 md:px-6 py-16 max-w-6xl">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-5 mb-10">
          <div className="flex items-center gap-2 text-neutral-800 font-extrabold text-lg">
            <CalendarDays className="w-5 h-5 text-[#003d29]" />
            <h2>Latest Drops</h2>
          </div>
          <span className="text-xs font-semibold text-neutral-400">{products.length} Items Available</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-sm max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-100">
              <Sparkles className="h-7 w-7 text-neutral-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 tracking-tight">No products found</h2>
            <p className="text-neutral-500 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
              We are currently preparing our next line of premium apparel. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((product, idx) => {
              const productImages = parseImages(product.images);
              
              // Highlight the absolute top 3 newest arrivals with a gorgeous "JUST ADDED" label
              const isBrandNew = idx < 3;

              return (
                <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:border-neutral-200/60">
                  {/* Image Link */}
                  <Link 
                    href={`/product/${product.id}`} 
                    className="block relative aspect-square overflow-hidden bg-neutral-50 rounded-xl mb-4"
                  >
                    <Image 
                      src={productImages?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                      alt={product.name} 
                      fill 
                      className={`object-cover transition-transform duration-700 ${product.stock <= 0 ? 'grayscale' : 'group-hover:scale-105'}`} 
                    />
                    
                    {/* Category Label */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-neutral-100">
                      {product.category?.name || 'Clothing'}
                    </div>

                    {/* Dynamic New Arrival Badges */}
                    {isBrandNew && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-[#003d29] text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md border border-[#004d34] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping"></span>
                        <span>Just Added</span>
                      </div>
                    )}

                    {product.discountPercent > 0 && !isBrandNew && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-amber-400 text-neutral-900 text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">
                        -{product.discountPercent}%
                      </div>
                    )}

                    {/* Out of stock label */}
                    {product.stock <= 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2.5 text-center border-t border-neutral-200">
                        <span className="text-neutral-800 text-xs font-bold tracking-widest uppercase">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <Link href={`/product/${product.id}`} className="flex-1">
                        <h3 className="font-extrabold text-[15px] leading-snug text-neutral-900 group-hover:text-[#003d29] transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex flex-col items-end text-right shrink-0">
                        {product.discountPercent > 0 ? (
                          <>
                            <span className="font-black text-[#003d29] text-[16px]">${(product.price * (1 - product.discountPercent / 100)).toFixed(2)}</span>
                            <span className="text-[11px] font-semibold text-neutral-400 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-black text-neutral-900 text-[16px]">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Action Button */}
                    <Link href={`/product/${product.id}`} className="mt-auto block w-full">
                      <Button variant="outline" className="w-full rounded-full border-neutral-200 text-neutral-800 hover:bg-[#003d29] hover:text-white hover:border-[#003d29] transition-all font-semibold h-10 text-[13px] flex items-center justify-center gap-1.5 group/btn">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
