'use client';

import { useState } from 'react';
import { User, Phone, MapPin, Loader2, Save, CheckCircle2 } from 'lucide-react';

interface ProfileSettingsProps {
  user: {
    phone: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  const [zip, setZip] = useState(user.zip || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, address, city, zip }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 rounded-lg">
          <User className="h-5 w-5 text-[#0F3460]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1A1A2E]">Personal Information</h2>
          <p className="text-sm text-neutral-500">Update your contact details for faster checkout</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Profile updated successfully
          </div>
        )}

        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#0F3460]" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all"
              placeholder="+63 912 345 6789"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0F3460]" />
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all"
              placeholder="e.g. 123 Main St, Apt 4B"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-neutral-700">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all"
                placeholder="e.g. New York"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-neutral-700">ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all"
                placeholder="e.g. 10001"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white font-semibold flex items-center justify-center rounded-xl shadow-md disabled:opacity-70 transition-all gap-2 min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
