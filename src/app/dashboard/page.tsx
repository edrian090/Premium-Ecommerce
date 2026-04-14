import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Package, Heart, History, ShoppingBag, Truck, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }

  // Fetch orders and wishlist for the logged in user
  const [orders, wishlist, user] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    }),
    prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true, address: true, city: true, zip: true, profileCompleted: true }
    })
  ]);

  const wishlistCount = wishlist?.items.length || 0;

  // Calculate status counts
  const statusCounts = {
    TO_PAY: orders.filter(o => o.status === 'TO_PAY').length,
    TO_SHIP: orders.filter(o => o.status === 'TO_SHIP').length,
    TO_RECEIVE: orders.filter(o => o.status === 'TO_RECEIVE').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">My Account</h1>
        <p className="text-gray-500 text-lg">Welcome back, {session.user.name || session.user.email}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Profile</CardTitle>
            <User className="h-4 w-4 text-[#0F3460]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A1A2E]">{user?.profileCompleted ? 'Complete' : 'Incomplete'}</div>
            <p className="text-xs text-neutral-400 mt-1">{user?.phone || 'No phone added'}</p>
          </CardContent>
        </Card>

        <Link href="/purchases">
          <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-[#0F3460]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Orders</CardTitle>
              <Package className="h-4 w-4 text-[#0F3460]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A2E]">{orders.length}</div>
              <p className="text-xs text-neutral-400 mt-1">View all purchases →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/wishlist">
          <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-red-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Wishlist</CardTitle>
              <Heart className="h-4 w-4 text-[#0F3460]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A2E]">{wishlistCount}</div>
              <p className="text-xs text-neutral-400 mt-1">Saved items</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Browsing</CardTitle>
            <History className="h-4 w-4 text-[#0F3460]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A1A2E]">Recent</div>
            <p className="text-xs text-neutral-400 mt-1">View history</p>
          </CardContent>
        </Card>
      </div>

      {user && <ProfileSettings user={user} />}

      {/* Purchase Status Shortcuts */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#0F3460]" />
            My Purchases
          </h2>
          <Link href="/purchases" className="text-sm text-[#0F3460] hover:underline font-medium">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/purchases?tab=TO_SHIP" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-blue-50 border border-blue-100 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="relative">
              <Package className="h-7 w-7 text-blue-600" />
              {statusCounts.TO_SHIP > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {statusCounts.TO_SHIP}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-blue-700">To Ship</span>
          </Link>

          <Link href="/purchases?tab=TO_RECEIVE" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-purple-50 border border-purple-100 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="relative">
              <Truck className="h-7 w-7 text-purple-600" />
              {statusCounts.TO_RECEIVE > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                  {statusCounts.TO_RECEIVE}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-purple-700">To Receive</span>
          </Link>

          <Link href="/purchases?tab=DELIVERED" className="flex flex-col items-center gap-2 p-5 rounded-xl bg-pink-50 border border-pink-100 hover:shadow-md transition-all hover:scale-[1.02]">
            <div className="relative">
              <Star className="h-7 w-7 text-pink-600" />
              {statusCounts.DELIVERED > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                  {statusCounts.DELIVERED}
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-pink-700">To Rate</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Recent Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-lg">
            <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No orders yet</h3>
            <p className="text-neutral-500">When you place an order, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-[#F9FAFB]">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-neutral-200">
                  <div>
                    <p className="text-xs font-mono text-gray-500 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-medium text-[#1A1A2E]">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-[#E94560]">${order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mt-2 ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'TO_SHIP' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'TO_RECEIVE' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'DELIVERED' ? 'bg-pink-100 text-pink-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 mt-4">
                  {order.items.map((item) => {
                    let images: string[] = [];
                    try {
                      images = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
                    } catch { images = []; }
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded border border-neutral-200 overflow-hidden flex-shrink-0">
                            {images?.[0] ? (
                              <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-100" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A1A2E]">{item.product.name}</p>
                            <p className="text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium text-neutral-700">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
