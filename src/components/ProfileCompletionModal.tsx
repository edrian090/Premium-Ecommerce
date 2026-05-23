'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, X, ShoppingCart, CheckCircle2, Loader2, Building2, Hash } from 'lucide-react';

export function ProfileCompletionModal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data && !data.profileCompleted) {
            setIsOpen(true);
            if (data.phone) setPhone(data.phone);
            if (data.address) setAddress(data.address);
            if (data.city) setCity(data.city);
            if (data.zip) setZip(data.zip);
          }
        })
        .catch(() => {});
    }
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, address, city, zip }),
      });

      if (res.ok) {
        setSaved(true);
        router.refresh(); // Re-fetch server component data immediately
        setTimeout(() => setIsOpen(false), 1800);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => setIsOpen(false);

  if (!isOpen) return null;

  const filledCount = [phone, address, city, zip].filter(Boolean).length;
  const progress = (filledCount / 4) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg mx-0 sm:mx-4 z-10">
        <div
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 -8px 60px rgba(0,61,41,0.15), 0 4px 40px rgba(0,0,0,0.15)' }}
        >
          {/* Top accent line */}
          <div className="h-1 w-full bg-[#003d29]" />

          {saved ? (
            /* ── Success State ── */
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
                  <CheckCircle2 className="w-10 h-10 text-[#003d29]" strokeWidth={2} />
                </div>
                <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 opacity-40" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">Profile Saved!</h3>
              <p className="text-neutral-500 text-sm font-medium">
                Your account is now ready for checkout.
              </p>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div className="px-7 pt-7 pb-5">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    {/* Brand icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#003d29] flex items-center justify-center shadow-md flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight">
                        Complete Your Profile
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium mt-0.5">
                        Shopcart · One-time setup
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-all flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>

                <p className="text-sm text-neutral-500 leading-relaxed">
                  Add your delivery details for a faster, smoother checkout. You can always update these in your account settings.
                </p>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Profile Completeness</span>
                    <span className="text-[11px] font-bold text-[#003d29]">{filledCount}/4 fields</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#003d29] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-100 mx-7" />

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="px-7 pt-5 pb-7 space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-sm text-red-600 font-semibold">{error}</p>
                  </div>
                )}

                {/* Phone */}
                <div className="group">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +63 912 345 6789"
                    required
                    className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-[#1A1A2E] text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-[#003d29] focus:bg-white transition-all duration-200"
                  />
                </div>

                {/* Address */}
                <div className="group">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Street Address
                    </span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Building, Unit No."
                    required
                    className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-[#1A1A2E] text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-[#003d29] focus:bg-white transition-all duration-200"
                  />
                </div>

                {/* City + ZIP */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        City
                      </span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      required
                      className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-[#1A1A2E] text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-[#003d29] focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        ZIP Code
                      </span>
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="ZIP"
                      required
                      className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-[#1A1A2E] text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-[#003d29] focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 h-12 rounded-xl border-2 border-neutral-200 text-neutral-500 text-sm font-semibold hover:border-neutral-300 hover:text-neutral-700 hover:bg-neutral-50 transition-all duration-200"
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 rounded-xl bg-[#003d29] hover:bg-[#002d1f] active:scale-[0.98] text-white text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#003d29]/25 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save & Continue'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
