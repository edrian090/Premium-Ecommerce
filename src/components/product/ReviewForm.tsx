'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('You must be logged in to leave a review.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment })
      });
      if (res.ok) {
        setSubmitted(true);
        // Usually we would refresh the router here to fetch the new reviews: router.refresh() 
        // For simplicity we show a success state.
        window.location.reload(); 
      } else {
        alert("Failed to submit review");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <div className="p-6 bg-green-50 text-green-800 rounded-xl my-8 border border-green-200">Thank you for your review!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-100">
      <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Leave a Review</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">Your Review (Optional)</label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-[#0F3460] focus:outline-none focus:ring-1 focus:ring-[#0F3460]"
          placeholder="What did you think of this product?"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="bg-[#0F3460] hover:bg-[#1A1A2E] text-white px-8 py-2 h-auto text-base"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
