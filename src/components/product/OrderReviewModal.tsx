'use client';

import { useState } from 'react';
import { Star, X, Loader2, MessageSquare, Package, Check } from 'lucide-react';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    images: string[] | string;
  };
}

interface OrderReviewModalProps {
  orderId: string;
  items: OrderItem[];
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OrderReviewModal({ orderId, items, open, onClose, onComplete }: OrderReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Store ratings/comments per product ID
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>(
    items.reduce((acc, item) => ({
      ...acc,
      [item.product.id]: { rating: 5, comment: '' }
    }), {})
  );

  if (!open) return null;

  const handleRatingChange = (productId: string, newRating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating: newRating }
    }));
  };

  const handleCommentChange = (productId: string, newComment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment: newComment }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Submit a review for each product
      for (const item of items) {
        const reviewData = reviews[item.product.id];
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            rating: reviewData.rating,
            comment: reviewData.comment || 'No comment provided' // Optional comment
          })
        });

        if (!res.ok) {
          throw new Error('Failed to submit one or more reviews');
        }
      }

      // Update Order Status to COMPLETED
      const statusRes = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (!statusRes.ok) {
        throw new Error('Failed to mark order as completed');
      }

      setSubmitted(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E]">Rate Your Purchase</h2>
              <p className="text-sm text-neutral-500">Order #{orderId.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5 border-[6px] border-green-50 shadow-sm animate-in zoom-in delay-100 duration-300">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 tracking-tight">Successfully Submitted!</h3>
            <p className="text-neutral-500 text-sm max-w-[250px]">
              Thank you for sharing your feedback. Your order is now completed.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}

          <form id="review-form" onSubmit={handleSubmit} className="space-y-8">
            {items.map((item) => {
              const reviewData = reviews[item.product.id];
              let imageUrl = '';
              try {
                if (typeof item.product.images === 'string') {
                  const parsed = JSON.parse(item.product.images);
                  imageUrl = parsed[0] || '';
                } else if (Array.isArray(item.product.images)) {
                  imageUrl = item.product.images[0] || '';
                }
              } catch {
                imageUrl = '';
              }

              return (
                <div key={item.id} className="p-5 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-lg border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-neutral-300" />
                      )}
                    </div>
                    <h3 className="font-semibold text-neutral-900">{item.product.name}</h3>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-neutral-100">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                        Product Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(item.product.id, star)}
                            className="focus:outline-none transition-transform hover:scale-110 p-1"
                          >
                            <Star 
                              className={`w-8 h-8 ${star <= reviewData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                        Written Feedback
                      </label>
                      <textarea
                        rows={3}
                        value={reviewData.comment}
                        onChange={(e) => handleCommentChange(item.product.id, e.target.value)}
                        placeholder="Tell us what you liked about this product..."
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all resize-none text-sm placeholder:text-neutral-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-medium text-neutral-600 hover:bg-neutral-200/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="review-form"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#E94560] to-[#c2334b] hover:from-[#c2334b] hover:to-[#E94560] text-white font-semibold flex items-center justify-center rounded-xl shadow-md disabled:opacity-70 transition-all gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
