'use client';
import { useState, useEffect } from 'react';
import { X, Tag, Plus, Loader2 } from 'lucide-react';

interface VoucherFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoucherFormModal({ open, onClose, onSuccess }: VoucherFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    if (open) {
      // Reset form on open
      setCode('');
      setDescription('');
      setDiscountType('PERCENTAGE');
      setDiscountValue('');
      setMinSpend('0');
      setMaxDiscount('');
      setUsageLimit('100');
      setExpiresAt('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minSpend: minSpend ? parseFloat(minSpend) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : 100,
        expiresAt: expiresAt ? expiresAt : null,
      };

      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create voucher');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#0F3460] rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800">Create New Voucher</h2>
              <p className="text-sm text-neutral-500">Provide details for the new discount code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Voucher Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] font-mono text-lg uppercase tracking-wider transition-all placeholder:text-neutral-300"
                    placeholder="e.g. SUMMER20"
                  />
                  <p className="text-xs text-neutral-500">Must be unique (e.g. WELCOME10)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all resize-none text-sm placeholder:text-neutral-400"
                    placeholder="Brief description of when this voucher applies"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-neutral-700">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all text-sm bg-white"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-neutral-700">Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all text-sm"
                      placeholder={discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 20.00'}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Minimum Spend ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all text-sm"
                    placeholder="0.00"
                  />
                </div>

                {discountType === 'PERCENTAGE' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-neutral-700">Maximum Discount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all text-sm"
                      placeholder="Leave blank for no cap"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all text-sm"
                    placeholder="e.g. 100"
                  />
                  <p className="text-xs text-neutral-500">How many times this voucher can be used in total</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all text-sm"
                  />
                  <p className="text-xs text-neutral-500">Leave blank for no expiration</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-neutral-600 hover:bg-neutral-200/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="voucher-form"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white font-semibold flex items-center justify-center rounded-xl shadow-md disabled:opacity-70 transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Voucher
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
