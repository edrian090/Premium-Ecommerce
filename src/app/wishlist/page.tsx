import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartCrack } from "lucide-react";
import { redirect } from "next/navigation";
import { WishlistButton } from "@/components/product/WishlistButton";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const products = wishlist?.items.map(item => item.product) || [];

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <HeartCrack className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven&apos;t saved any products to your wishlist yet. Discover our premium collection!</p>
        <Link href="/">
          <Button size="lg" className="bg-[#E94560] hover:bg-[#c8354c] text-white">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-10">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl bg-white flex flex-col">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <Image 
                src={JSON.parse(product.images || '[]')?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-[#1A1A2E] mb-2 truncate">{product.name}</h3>
              <p className="text-xl font-extrabold text-[#E94560] mb-4">${product.price.toFixed(2)}</p>
              
              <div className="mt-auto flex items-center justify-between gap-3">
                <Link href={`/product/${product.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-colors">
                    Details
                  </Button>
                </Link>
                <WishlistButton productId={product.id} initialWished={true} refreshOnUpdate={true} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
