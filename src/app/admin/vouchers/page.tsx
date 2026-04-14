'use client';

import { useEffect, useState, useCallback } from 'react';
import { Tag, Plus, Trash2, AlertTriangle, Percent, Banknote, RefreshCcw } from 'lucide-react';
import VoucherFormModal from '@/components/admin/VoucherFormModal';

interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minSpend: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  
  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vouchers');
      const data = await res.json();
      if (res.ok) {
        setVouchers(data);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchVouchers();
        showToast(`Voucher "${deleteTarget.code}" deleted successfully`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    fetchVouchers();
    showToast('Voucher created successfully');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A2E] text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Voucher Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Create and track platform discount codes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVouchers}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors bg-white shadow-sm"
            title="Refresh"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0F3460]/20 hover:shadow-lg hover:shadow-[#0F3460]/30"
          >
            <Plus className="h-4 w-4" />
            Create Voucher
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
            <p className="text-sm text-neutral-500 font-medium">Loading vouchers…</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-neutral-300" />
            </div>
            <p className="font-semibold text-neutral-600">No vouchers yet</p>
            <p className="text-sm text-neutral-400 mt-1.5 mx-auto">
              Click "Create Voucher" to generate your first discount code.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Code</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Discount</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Usage</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Valid Until</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {vouchers.map((v) => {
                  const isExpired = v.expiresAt && new Date(v.expiresAt) < new Date();
                  const isFullyUsed = v.usedCount >= v.usageLimit;
                  const isReady = v.isActive && !isExpired && !isFullyUsed;

                  return (
                    <tr key={v.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 tracking-wide bg-neutral-100 px-2 py-0.5 rounded font-mono text-sm border border-neutral-200">
                              {v.code}
                            </span>
                            {isReady ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Active</span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Inactive</span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-1.5 max-w-[200px] line-clamp-1">{v.description}</p>
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${v.discountType === 'PERCENTAGE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {v.discountType === 'PERCENTAGE' ? <Percent className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-neutral-800">
                              {v.discountType === 'PERCENTAGE' ? `${v.discountValue}% OFF` : `$${v.discountValue.toFixed(2)} OFF`}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">Min spend: ${v.minSpend.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={isFullyUsed ? 'text-red-500' : 'text-neutral-700'}>{v.usedCount} Used</span>
                            <span className="text-neutral-400">/ {v.usageLimit}</span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${isFullyUsed ? 'bg-red-400' : 'bg-[#0F3460]'}`} 
                              style={{ width: `${Math.min((v.usedCount / v.usageLimit) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-4 hidden sm:table-cell text-sm">
                        {v.expiresAt ? (
                          <div className="flex flex-col">
                            <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-neutral-700'}`}>
                              {new Date(v.expiresAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {new Date(v.expiresAt).toLocaleTimeString(undefined, {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 font-medium bg-neutral-100 px-2 py-1 rounded text-xs">Never expires</span>
                        )}
                      </td>
                      <td className="px-5 lg:px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(v)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm bg-white border border-transparent hover:border-red-100"
                          title="Delete Voucher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <VoucherFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 text-center">Delete Voucher</h3>
            <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-neutral-700 uppercase font-mono tracking-wider">{deleteTarget.code}</span>? This permanently disables the code.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
