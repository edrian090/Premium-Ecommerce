'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Package, Truck, Star, 
  CheckCircle2, ShoppingBag, Loader2,
  CreditCard, Wallet, Banknote, Tag
} from 'lucide-react';
import { OrderReviewModal } from '@/components/product/OrderReviewModal';

const TABS = [
  { id: 'ALL', label: 'All', icon: Package },
  { id: 'TO_SHIP', label: 'To Ship', icon: Package },
  { id: 'TO_RECEIVE', label: 'To Receive', icon: Truck },
  { id: 'DELIVERED', label: 'To Rate', icon: Star },
  { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'TO_PAY': { label: 'To Pay', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'TO_SHIP': { label: 'To Ship', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  'TO_RECEIVE': { label: 'To Receive', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  'DELIVERED': { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  'TO_RATE': { label: 'To Rate', color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
  'COMPLETED': { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'PAID': { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  'PENDING': { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
};

const PAYMENT_ICONS: Record<string, any> = {
  'COD': Banknote,
  'GCASH': Wallet,
  'CARD': CreditCard,
};

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  voucherCode: string | null;
  discountAmount: number;
  shippingAddress: string | null;
  createdAt: string;
  items: OrderItem[];
}

function PurchasesContent() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ALL';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchOrders();
    }
  }, [activeTab, authStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${activeTab}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const getActionButton = (order: Order) => {
    if (actionLoading === order.id) {
      return (
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating...
        </Button>
      );
    }
    
    switch (order.status) {
      case 'DELIVERED':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => setReviewOrder(order)}
              className="bg-[#E94560] hover:bg-[#d63d56] text-white gap-2"
            >
              <Star className="h-4 w-4" />
              Rate & Review
            </Button>
          </div>
        );
      case 'TO_RATE':
        return (
          <Button 
            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
            variant="outline"
            className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as Complete
          </Button>
        );
      default:
        return null;
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F3460]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-[#0F3460]" />
          My Purchases
        </h1>
        <p className="text-neutral-500">Track and manage all your orders</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 flex-1 justify-center ${
                  isActive 
                    ? 'border-[#E94560] text-[#E94560] bg-red-50/50' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#E94560]' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F3460] mb-4" />
          <p className="text-neutral-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-16 text-center">
          <Package className="h-16 w-16 text-neutral-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No orders found</h3>
          <p className="text-neutral-400 mb-6">
            {activeTab === 'ALL' 
              ? "You haven't placed any orders yet."
              : `No orders with "${TABS.find(t => t.id === activeTab)?.label}" status.`
            }
          </p>
          <Button 
            onClick={() => router.push('/products')}
            className="bg-[#0F3460] hover:bg-[#1A1A2E] text-white"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING'];
            const PaymentIcon = PAYMENT_ICONS[order.paymentMethod] || CreditCard;
            
            return (
              <div key={order.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-200 gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-neutral-400">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Payment method badge */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white px-2.5 py-1 rounded-full border">
                      <PaymentIcon className="h-3.5 w-3.5" />
                      {order.paymentMethod}
                    </div>
                    {/* Status badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.items.map((item) => {
                    const imageUrl = item.product.images?.[0] || '';
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-neutral-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{item.product.name}</p>
                          <p className="text-sm text-neutral-400">x{item.quantity}</p>
                        </div>
                        <p className="font-medium text-neutral-700">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-200 gap-3">
                  <div className="flex items-center gap-4">
                    {order.discountAmount > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <Tag className="h-3.5 w-3.5" />
                        Saved ${order.discountAmount.toFixed(2)}
                        {order.voucherCode && <span className="font-mono">({order.voucherCode})</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm text-neutral-400">Order Total: </span>
                      <span className="text-xl font-bold text-[#E94560]">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    {getActionButton(order)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <OrderReviewModal
          orderId={reviewOrder.id}
          items={reviewOrder.items}
          open={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          onComplete={() => {
            setReviewOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F3460]" />
      </div>
    }>
      <PurchasesContent />
    </Suspense>
  );
}
