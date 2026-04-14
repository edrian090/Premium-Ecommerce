'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  ShoppingCart, ChevronLeft, ChevronRight, MapPin,
  Package, Clock, Truck, CheckCircle2, XCircle, CreditCard,
  ChevronDown,
} from 'lucide-react';
import StatusBadge, { OrderStatus } from '@/components/admin/StatusBadge';

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  PAID: CreditCard,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

interface OrderItem {
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: string | null;
  user: { id: string; name: string | null; email: string | null; image: string | null };
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const LIMIT = 15;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: LIMIT.toString() });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (res.ok) { setOrders(data.orders); setTotal(data.total); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        showToast(`Order updated to ${status.toLowerCase()}`);
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);



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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Orders</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} total order{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            statusFilter === ''
              ? 'bg-[#0F3460] text-white shadow-md shadow-[#0F3460]/20'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
          }`}
        >
          All ({total})
        </button>
        {ALL_STATUSES.map((s) => {
          const Icon = STATUS_ICONS[s];
          return (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === s
                  ? 'bg-[#0F3460] text-white shadow-md shadow-[#0F3460]/20'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="w-10 h-10 border-4 border-[#0F3460]/20 rounded-full" />
              <div className="w-10 h-10 border-4 border-[#0F3460] border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-neutral-300" />
            </div>
            <p className="font-semibold text-neutral-600">No orders found</p>
            <p className="text-sm text-neutral-400 mt-1.5">
              {statusFilter ? `No ${statusFilter.toLowerCase()} orders right now.` : 'Orders will show up when customers place them.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Order</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {orders.map((order) => {
                  const isExpanded = expandedId === order.id;
                  return (
                    <> 
                      <tr
                        key={order.id}
                        className={`hover:bg-neutral-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-neutral-50/30' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="px-5 lg:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <ChevronDown className={`h-3.5 w-3.5 text-neutral-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </td>
                        <td className="px-5 lg:px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F3460] to-[#1A1A2E] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                              {(order.user.name || order.user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-neutral-800 text-sm">{order.user.name || 'Unknown'}</div>
                              <div className="text-[11px] text-neutral-400">{order.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 lg:px-6 py-4 text-neutral-500 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <Package className="h-3.5 w-3.5 text-neutral-400" />
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-5 lg:px-6 py-4">
                          <span className="font-bold text-neutral-800">${order.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-5 lg:px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 lg:px-6 py-4 text-xs text-neutral-400 hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 lg:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {order.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-100 shadow-sm cursor-not-allowed opacity-90">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              FINALIZED
                            </span>
                          ) : (
                            <div className="relative">
                              <select
                                value={order.status}
                                disabled={updatingId === order.id}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className="text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all disabled:opacity-50 cursor-pointer appearance-none pr-7 font-medium"
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
                            </div>
                          )}
                          {updatingId === order.id && (
                            <span className="text-[11px] text-neutral-400 mt-1 block">Saving…</span>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr key={`${order.id}-expand`}>
                          <td colSpan={7} className="px-5 lg:px-6 py-0">
                            <div className="py-4 border-t border-dashed border-neutral-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Items */}
                                <div>
                                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5" />
                                    Order Items
                                  </p>
                                  <div className="space-y-2">
                                    {order.items.map((item, i) => (
                                      <div key={i} className="flex items-center gap-3 bg-neutral-50 rounded-lg p-2.5">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-neutral-100">
                                          {item.product.images?.[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                                          ) : (
                                            <Package className="h-3.5 w-3.5 text-neutral-300" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-neutral-700 truncate">{item.product.name}</p>
                                          <p className="text-[11px] text-neutral-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-700">
                                          ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Details */}
                                <div>
                                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Order Details
                                  </p>
                                  <div className="bg-neutral-50 rounded-lg p-3.5 space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-neutral-500">Order ID</span>
                                      <span className="font-mono text-neutral-700 text-xs">{order.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-neutral-500">Date</span>
                                      <span className="text-neutral-700">{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-neutral-500">Total</span>
                                      <span className="font-bold text-neutral-800">${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    {order.shippingAddress && (
                                      <div className="pt-2 border-t border-neutral-200">
                                        <p className="text-xs text-neutral-400 flex items-center gap-1 mb-1">
                                          <MapPin className="h-3 w-3" /> Shipping Address
                                        </p>
                                        <p className="text-sm text-neutral-700">{order.shippingAddress}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            Showing <span className="font-semibold text-neutral-700">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> of <span className="font-semibold text-neutral-700">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-[#0F3460] text-white shadow'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors text-sm font-medium"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
