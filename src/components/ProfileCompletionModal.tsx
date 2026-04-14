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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-[#0F3460] via-[#16213E] to-[#1A1A2E] px-8 pt-8 pb-12">
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Add your contact details for a smoother checkout experience. You can always update these later.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 -mt-6">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-100 p-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#0F3460]" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +63 912 345 6789"
                  className="h-12 text-base border-neutral-200 focus-visible:ring-[#0F3460]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#0F3460]" />
                  Address
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Building, Unit"
                  className="h-12 text-base border-neutral-200 focus-visible:ring-[#0F3460]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">City</label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-12 text-base border-neutral-200 focus-visible:ring-[#0F3460]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">ZIP Code</label>
                  <Input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP"
                    className="h-12 text-base border-neutral-200 focus-visible:ring-[#0F3460]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 h-12 text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white font-semibold transition-all duration-300"
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
