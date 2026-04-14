import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { WishlistButton } from '@/components/product/WishlistButton';
import { Shield, Truck, RotateCcw, Star, AlertTriangle } from 'lucide-react';
import { parseImages } from '@/lib/utils';

import prisma from '@/lib/prisma';

const getProduct = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
};

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 text-neutral-900">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Product Image Gallery (Simplified) */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-md">
            <Image 
              src={parseImages(product.images)[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop'} 
              alt={product.name} 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-2 text-sm font-bold text-[#E94560] tracking-wide uppercase">New Arrival</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A2E] mb-4 tracking-tight leading-tight">
            {product.name}
          </h1>
          <div className="text-3xl font-bold text-neutral-900 mb-4">
            ${product.price.toFixed(2)}
          </div>

          {/* Stock Status */}
          {product.stock <= 0 ? (
            <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-semibold">Out of Stock</span>
            </div>
          ) : product.stock <= 5 ? (
            <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 font-semibold">Only {product.stock} left in stock — order soon!</span>
            </div>
          ) : (
            <div className="mb-6 text-sm text-green-600 font-medium">✓ In Stock ({product.stock} available)</div>
          )}

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>
          
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-[#1A1A2E] text-lg">Key Features</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              {['Premium Quality', 'Fast Shipping', '24/7 Support'].map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 align-middle mb-10 pt-6 border-t border-gray-200">
            <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, image: parseImages(product.images)[0] }} stock={product.stock} />
            <WishlistButton productId={product.id} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-50 text-[#0F3460] rounded-full"><Truck className="w-6 h-6"/></div>
              <span className="text-sm font-medium text-[#1A1A2E]">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-50 text-[#0F3460] rounded-full"><Shield className="w-6 h-6"/></div>
              <span className="text-sm font-medium text-[#1A1A2E]">2 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-50 text-[#0F3460] rounded-full"><RotateCcw className="w-6 h-6"/></div>
              <span className="text-sm font-medium text-[#1A1A2E]">30 Day Returns</span>
            </div>
          </div>
        </div>

      </div>

      {/* Reviews Section */}
      <div className="mt-24 border-t border-neutral-200 pt-16">
        <h2 className="text-3xl font-bold text-[#1A1A2E] mb-8">Customer Reviews</h2>
        
        {product.reviews.length === 0 ? (
          <p className="text-neutral-500 italic">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-[#1A1A2E]">{review.user.name || 'Anonymous User'}</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>}
                <div className="text-xs text-neutral-400 mt-4">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
