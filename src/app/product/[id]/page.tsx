import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { parseImages } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductDetailsClient } from '@/components/product/ProductDetailsClient';

const getProduct = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

/* ── Helpers ─────────────────────────────────── */
function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function ratingCounts(reviews: { rating: number }[]) {
  const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { map[r.rating] = (map[r.rating] || 0) + 1; });
  return map;
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

/* ── Page ────────────────────────────────────── */
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const images = parseImages(product.images);
  const avg = avgRating(product.reviews);
  const counts = ratingCounts(product.reviews);
  const total = product.reviews.length;

  const finalPrice =
    product.discountPercent > 0
      ? product.price * (1 - product.discountPercent / 100)
      : product.price;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-8">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-medium">Product details</span>
        </nav>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left — Image gallery */}
          <ProductImageGallery images={images} productName={product.name} />

          {/* Right — Details */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <span className="text-xs font-semibold text-neutral-400 tracking-widest uppercase mb-2">
                {product.category.name}
              </span>
            )}

            {/* Product name */}
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Interactive details (client component) */}
            <ProductDetailsClient
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                discountPercent: product.discountPercent,
                description: product.description,
                stock: product.stock,
                image: images[0] || '',
              }}
            />
          </div>
        </div>

        {/* ── Rating & Reviews ── */}
        <section className="mt-20 pt-12 border-t border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">Rating &amp; Reviews</h2>

          {total === 0 ? (
            <p className="text-neutral-400 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">

              {/* Left — aggregate score */}
              <div className="flex flex-col justify-center">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-7xl font-extrabold text-neutral-900 leading-none">
                    {avg.toFixed(1).replace('.', ',')}
                  </span>
                  <span className="text-2xl text-neutral-400 mb-2">/ 5</span>
                </div>
                <p className="text-sm text-neutral-500 mb-6">({total} New Review{total !== 1 ? 's' : ''})</p>

                {/* Star bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = counts[star] || 0;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-500 w-2">{star}</span>
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400 w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right — review cards */}
              <div className="space-y-5">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border border-neutral-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-semibold text-neutral-900">{review.user.name || 'Anonymous'}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`}
                          />
                        ))}
                        <span className="text-xs text-neutral-400 ml-2">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-neutral-600 leading-relaxed mb-4">{review.comment}</p>
                    )}
                    {/* Avatar row */}
                    <div className="flex items-center gap-3 pt-3 border-t border-neutral-50">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 flex-shrink-0">
                        {getInitials(review.user.name)}
                      </div>
                      <span className="text-xs text-neutral-400">{review.user.name || 'Anonymous User'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
