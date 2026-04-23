import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PackageSearch } from "lucide-react";

import { parseImages } from "@/lib/utils";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; categoryId?: string };
}) {
  const { search, categoryId } = searchParams;

  const whereClause: any = {};
  
  if (search) {
    whereClause.name = {
      contains: search,
    };
  }
  
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany()
  ]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
            <h2 className="font-bold text-lg mb-4 text-[#1A1A2E] border-b pb-2">Categories</h2>
            <div className="space-y-2">
              <Link href={`/products${search ? `?search=${search}` : ''}`} className={`block py-1.5 text-sm transition-colors ${!categoryId ? 'font-bold text-[#0F3460]' : 'text-neutral-500 hover:text-neutral-800'}`}>
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?categoryId=${cat.id}${search ? `&search=${search}` : ''}`}
                  className={`block py-1.5 text-sm transition-colors ${categoryId === cat.id ? 'font-bold text-[#0F3460]' : 'text-neutral-500 hover:text-neutral-800'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">
              {search ? `Search results for "${search}"` : 'All Products'}
            </h1>
            <p className="text-neutral-500 mt-2">Showing {products.length} products</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <PackageSearch className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <h2 className="text-xl font-bold text-neutral-700">No products found</h2>
              <p className="text-neutral-500 mt-2">Try adjusting your filters or search query.</p>
              <Link href="/products">
                <Button className="mt-6 bg-[#003d29] hover:bg-[#002b1c] text-white rounded-full px-6">Clear Filters</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product) => (
                <div key={product.id} className="group flex flex-col">
                  <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-neutral-100 rounded-2xl mb-4">
                    <Image 
                      src={parseImages(product.images)?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                      alt={product.name} 
                      fill 
                      className={`object-cover transition-transform duration-700 ${product.stock <= 0 ? 'grayscale' : 'group-hover:scale-105'}`} 
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                      {product.category?.name || 'Uncategorized'}
                    </div>
                    {product.discountPercent > 0 && product.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-white text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        -{product.discountPercent}%
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm py-2 text-center border-t border-neutral-200">
                        <span className="text-neutral-800 text-xs font-bold tracking-widest uppercase">
                          Out of Stock
                        </span>
                      </div>
                    )}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
