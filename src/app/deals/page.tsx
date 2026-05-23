import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag, Sparkles, Percent } from "lucide-react";
import { parseImages } from "@/lib/utils";
import CountdownTimer from "@/components/Deals/CountdownTimer";

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  // Query all products that have an active discount percentage
  const products = await prisma.product.findMany({
    where: {
      discountPercent: {
        gt: 0,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#003d29] to-[#002116] py-16 px-4 md:px-8 text-white shadow-md">
        {/* Abstract background decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#004d34]/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-neutral-900 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm mb-4">
              <Percent className="w-3.5 h-3.5 animate-bounce" />
              <span>Epic Clothes Deals</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              Premium Clothing <br />
              <span className="text-amber-300">Flash Sale!</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg font-medium max-w-md leading-relaxed">
              Step up your style with exclusive limited-time discounts on our premium apparel collection. Act fast before they sell out!
            </p>
          </div>
          
          {/* Interactive Client Countdown Component */}
          <div className="flex-shrink-0 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl max-w-sm w-full text-center">
            <h3 className="font-bold text-lg text-white mb-3 tracking-wide flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              Limited-Time Offers
            </h3>
            <p className="text-white/70 text-xs mb-5">
              Prices return to original rates at the end of the day. Free standard shipping applies.
            </p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Main Deals Grid */}
      <main className="container mx-auto px-4 md:px-6 py-16 max-w-6xl">
        <div className="flex justify-between items-end border-b border-neutral-100 pb-5 mb-10">
          <div>
            <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Active Offers</h2>
            <p className="text-neutral-500 text-sm mt-1">Showing {products.length} exclusive discounted items</p>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>SQLite Real-time Feed</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-sm max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-100">
              <Tag className="h-7 w-7 text-neutral-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 tracking-tight">No active discounts</h2>
            <p className="text-neutral-500 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
              Check back soon! We update our special deals daily with premium items and seasonal savings.
            </p>
            <Link href="/products" className="inline-block mt-6">
              <Button className="bg-[#003d29] hover:bg-[#002b1c] text-white rounded-full px-6 font-bold text-xs tracking-wider uppercase h-11 shadow-md">
                Browse All Apparel
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((product) => {
              const discountedPrice = product.price * (1 - product.discountPercent / 100);
              const savings = product.price - discountedPrice;
              const productImages = parseImages(product.images);

              return (
                <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-neutral-100/80 shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:border-neutral-200/60">
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

                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md animate-pulse">
                      {product.discountPercent}% OFF
                    </div>

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
                        <span className="font-black text-neutral-900 text-[16px]">${discountedPrice.toFixed(2)}</span>
                        <span className="text-xs font-semibold text-neutral-400 line-through">${product.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Savings Tag */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-md w-max mb-3 border border-red-100/50">
                      <Sparkles className="w-3 h-3" />
                      <span>Save ${savings.toFixed(2)}</span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Action Button */}
                    <Link href={`/product/${product.id}`} className="mt-auto block w-full">
                      <Button className="w-full bg-[#003d29] hover:bg-[#002b1c] text-white rounded-full font-bold text-[13px] h-10 shadow-sm transition-all duration-300">
                        Claim Deal
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
