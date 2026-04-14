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
            <div className="text-center py-20 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">
              <PackageSearch className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <h2 className="text-xl font-bold text-neutral-700">No products found</h2>
              <p className="text-neutral-500 mt-2">Try adjusting your filters or search query.</p>
              <Link href="/products">
                <Button className="mt-6 bg-[#0F3460] hover:bg-[#1A1A2E] text-white">Clear Filters</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className={`group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-xl bg-[#F5F5F5] ${product.stock <= 0 ? 'opacity-80' : ''}`}>
                  <div className="relative aspect-square overflow-hidden bg-white border-b border-neutral-100">
                    <Image 
                      src={parseImages(product.images)?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                      alt={product.name} 
                      fill 
                      className={`object-cover transition-transform duration-500 ${product.stock <= 0 ? 'grayscale' : 'group-hover:scale-110'}`} 
                    />
                    <div className="absolute top-4 right-4 bg-white text-neutral-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 border border-neutral-100">
                      {product.category?.name || 'Uncategorized'}
                    </div>
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                        <span className="bg-red-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg tracking-wide">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                        Only {product.stock} left
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg text-[#1A1A2E] mb-2 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 md:mb-4">{product.description}</p>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-[#E94560]">${product.price.toFixed(2)}</span>
                    <Link href={`/product/${product.id}`}>
                      <Button variant="outline" className="border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-colors">
                        Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
