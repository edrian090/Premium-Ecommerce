'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, AlertTriangle, X, Loader2, Check } from 'lucide-react';
import { parseImages } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ProductPerformanceClient({ analyzedProducts }: { analyzedProducts: any[] }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const openDiscountModal = (product: any) => {
    setSelectedProduct(product);
    setDiscountVal(product.discountPercent || 0);
  };

  const handleApplyDiscount = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedProduct,
          images: parseImages(selectedProduct.images),
          discountPercent: discountVal,
        })
      });
      
      if (res.ok) {
        setSelectedProduct(null);
        router.refresh(); // Refresh the server component payload
      } else {
        console.error("Failed to update discount");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {analyzedProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-neutral-300" />
            </div>
            <p className="font-semibold text-neutral-600">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Product</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Stock</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Discount</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Units Sold</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Gross Rev</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {analyzedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 relative ring-1 ring-neutral-100">
                          {parseImages(product.images)?.[0] ? (
                            <Image src={parseImages(product.images)[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-800 block truncate max-w-[200px]">{product.name}</span>
                          <span className="text-xs text-neutral-400 block">${product.price.toFixed(2)} Base Price</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <span className={`font-semibold ${product.stock <= 0 ? 'text-red-500' : 'text-neutral-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      {product.discountPercent > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-bold">
                          {product.discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        {product.unitsSold === 0 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {product.unitsSold}
                      </div>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <span className="font-bold text-emerald-600">${product.grossRevenue.toFixed(2)}</span>
                    </td>
                    <td className="px-5 lg:px-6 py-4 text-right">
                      <button 
                        onClick={() => openDiscountModal(product)}
                        className="text-xs px-3 py-1.5 font-medium rounded-lg border border-[#0F3460]/20 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-colors"
                      >
                        Apply Discount
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">Apply Discount</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-neutral-600 mb-4 line-clamp-1">
              For: <span className="font-semibold text-neutral-800">{selectedProduct.name}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountVal}
                onChange={(e) => setDiscountVal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3460]/30 focus:border-[#0F3460] transition-all"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isSaving ? 'Applying...' : 'Apply Discount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
