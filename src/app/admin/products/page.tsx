'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Package, Plus, Search, Pencil, Trash2, AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import ProductFormModal from '@/components/admin/ProductFormModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  discountPercent: number;
  images: string[];
  categoryId: string;
  createdAt: string;
  category?: { id: string; name: string };
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const openAdd = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        fetchProducts();
        showToast(`"${deleteTarget.name}" deleted successfully`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    fetchProducts();
    showToast(editProduct ? 'Product updated successfully' : 'Product created successfully');
  };

  const getStockStyle = (stock: number) => {
    if (stock === 0) return 'bg-red-50 text-red-700 border-red-200';
    if (stock < 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Out of stock';
    if (stock < 10) return `Low: ${stock}`;
    return `${stock} in stock`;
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
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Products</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {total} product{total !== 1 ? 's' : ''} in catalog
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0F3460]/20 hover:shadow-lg hover:shadow-[#0F3460]/30"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors font-medium"
          >
            Search
          </button>
        </form>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 self-start">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Grid
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
            <p className="text-sm text-neutral-500 font-medium">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-neutral-300" />
            </div>
            <p className="font-semibold text-neutral-600">No products found</p>
            <p className="text-sm text-neutral-400 mt-1.5 max-w-sm mx-auto">
              {search ? 'Try a different search term.' : 'Click "Add Product" to create your first listing.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="group border border-neutral-100 rounded-xl overflow-hidden hover:shadow-md hover:border-neutral-200 transition-all duration-300"
              >
                <div className="aspect-square relative bg-neutral-50 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-neutral-200" />
                    </div>
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-neutral-700" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="font-semibold text-neutral-800 text-sm truncate">{product.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold text-[#1A1A2E]">${product.price.toFixed(2)}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStockStyle(product.stock)}`}>
                      {getStockText(product.stock)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Product</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Price</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Stock</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Added</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 relative ring-1 ring-neutral-100">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-800 block truncate max-w-[200px]">{product.name}</span>
                          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1 max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <span className="font-bold text-neutral-800">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStyle(product.stock)}`}>
                        {getStockText(product.stock)}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {product.category?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4 text-neutral-400 text-xs hidden lg:table-cell">
                      {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 text-neutral-500 hover:text-[#0F3460] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        product={editProduct}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 text-center">Delete Product</h3>
            <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-neutral-700">"{deleteTarget.name}"</span>? This action cannot be undone.
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
