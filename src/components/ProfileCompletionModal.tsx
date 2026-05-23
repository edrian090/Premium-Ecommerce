'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, X, Sparkles } from 'lucide-react';

export function ProfileCompletionModal() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if profile is completed
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
        setIsOpen(false);
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

  const handleSkip = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#00140e]/75 backdrop-blur-md transition-opacity duration-300" 
        onClick={handleSkip} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg mx-4 z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,61,41,0.15)] border border-neutral-100 overflow-hidden">
          
          {/* Top Decorative Branding Accent Line */}
          <div className="h-2 w-full bg-gradient-to-r from-[#003d29] via-[#005a3d] to-amber-400" />
          
          {/* Close button */}
          <button 
            onClick={handleSkip}
            className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors p-2 hover:bg-neutral-50 rounded-full"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Header */}
          <div className="px-8 pt-8 pb-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
              <div className="p-3 bg-[#003d29]/5 rounded-2xl text-[#003d29] border border-[#003d29]/10 shrink-0">
                <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500/20 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Complete Your Profile</h2>
                <p className="text-neutral-500 text-sm mt-1">Add your details for a faster, premium checkout experience.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2">
            <div className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#003d29]" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +63 912 345 6789"
                  className="h-12 text-sm border-neutral-200 focus-visible:ring-[#003d29] focus-visible:border-[#003d29] rounded-xl pl-4"
                  required
                />
              </div>

              {/* Address Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#003d29]" />
                  Delivery Address
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, building, apartment/unit"
                  className="h-12 text-sm border-neutral-200 focus-visible:ring-[#003d29] focus-visible:border-[#003d29] rounded-xl pl-4"
                  required
                />
              </div>

              {/* City & ZIP Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">City</label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Manila"
                    className="h-12 text-sm border-neutral-200 focus-visible:ring-[#003d29] focus-visible:border-[#003d29] rounded-xl pl-4"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">ZIP Code</label>
                  <Input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="e.g. 1000"
                    className="h-12 text-sm border-neutral-200 focus-visible:ring-[#003d29] focus-visible:border-[#003d29] rounded-xl pl-4"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 h-12 rounded-full border border-neutral-200 text-neutral-600 hover:text-neutral-900 font-bold text-xs tracking-wider uppercase hover:bg-neutral-50 active:scale-[0.98] transition-all duration-200"
                >
                  Skip for now
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-[#003d29] hover:bg-[#002b1c] text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-[0_4px_12px_rgba(0,61,41,0.2)] hover:shadow-[0_6px_16px_rgba(0,61,41,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  {loading ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
