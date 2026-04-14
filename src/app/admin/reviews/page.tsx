'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, MessageSquare, RefreshCcw, Package } from 'lucide-react';

interface UserData {
  name: string | null;
  email: string | null;
}

interface ProductData {
  name: string;
  images: string | string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: UserData;
  product: ProductData;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Customer Feedback</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Monitor and evaluate customer ratings and reviews
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors bg-white shadow-sm"
            title="Refresh"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="w-10 h-10 border-4 border-[#0F3460]/20 rounded-full" />
              <div className="w-10 h-10 border-4 border-[#0F3460] border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">Loading feedback…</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-neutral-300" />
            </div>
            <p className="font-semibold text-neutral-600">No reviews yet</p>
            <p className="text-sm text-neutral-400 mt-1.5 mx-auto">
              When customers rate their delivered products, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Product</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Rating & Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {reviews.map((r) => {
                  let imageUrl = '';
                  try {
                    if (typeof r.product.images === 'string') {
                      imageUrl = JSON.parse(r.product.images)[0] || '';
                    } else if (Array.isArray(r.product.images)) {
                      imageUrl = r.product.images[0] || '';
                    }
                  } catch { imageUrl = ''; }

                  return (
                    <tr key={r.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 lg:px-6 py-4 align-top">
                        <span className="text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide">
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-5 lg:px-6 py-4 align-top">
                        <p className="font-medium text-neutral-900">{r.user.name || 'Anonymous User'}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{r.user.email}</p>
                      </td>
                      <td className="px-5 lg:px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-neutral-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {imageUrl ? (
                              <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-300" />
                            )}
                          </div>
                          <span className="font-semibold text-neutral-800 line-clamp-2 max-w-[200px]">
                            {r.product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} 
                              />
                            ))}
                            <span className="ml-2 text-xs font-bold text-neutral-400">{r.rating}.0</span>
                          </div>
                          {r.comment && r.comment !== 'No comment provided' && (
                            <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100 italic">
                              "{r.comment}"
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
