'use client';
import { useEffect, useState } from 'react';
import {
  DollarSign, Users, Package, ShoppingCart,
  TrendingUp, TrendingDown, Clock, ArrowUpRight,
  Activity,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import StatusBadge from '@/components/admin/StatusBadge';
import Link from 'next/link';

const SalesChart = dynamic(() => import('@/components/admin/SalesChart'), { ssr: false });

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string | null; email: string | null };
  items: { product: { name: string } }[];
}

const KPI_CARDS = (stats: Stats) => [
  {
    label: 'Total Revenue',
    value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sub: 'From paid, shipped & delivered',
    icon: DollarSign,
    trend: '+12.5%',
    trendUp: true,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGlow: 'bg-emerald-500/10',
    iconBg: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    label: 'Total Orders',
    value: stats.totalOrders.toLocaleString(),
    sub: `${stats.pendingOrders} pending · ${stats.deliveredOrders} delivered`,
    icon: ShoppingCart,
    trend: '+8.2%',
    trendUp: true,
    gradient: 'from-blue-500 to-blue-600',
    bgGlow: 'bg-blue-500/10',
    iconBg: 'bg-blue-500/15 text-blue-600',
  },
  {
    label: 'Registered Users',
    value: stats.totalUsers.toLocaleString(),
    sub: 'Active customer accounts',
    icon: Users,
    trend: '+4.1%',
    trendUp: true,
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/10',
    iconBg: 'bg-violet-500/15 text-violet-600',
  },
  {
    label: 'Total Products',
    value: stats.totalProducts.toLocaleString(),
    sub: 'Items in active catalog',
    icon: Package,
    trend: '+2',
    trendUp: true,
    gradient: 'from-orange-500 to-amber-600',
    bgGlow: 'bg-orange-500/10',
    iconBg: 'bg-orange-500/15 text-orange-600',
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setChartData(data.chartData);
        setRecentOrders(data.recentOrders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#0F3460]/20 rounded-full" />
            <div className="w-12 h-12 border-4 border-[#0F3460] border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600">Loading dashboard</p>
            <p className="text-xs text-neutral-400 mt-0.5">Fetching your analytics…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live data
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {KPI_CARDS(stats).map((card, i) => (
            <div
              key={card.label}
              className="group relative bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Background glow */}
              <div className={`absolute inset-0 ${card.bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-neutral-500">{card.label}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl lg:text-[28px] font-bold text-[#1A1A2E] tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-neutral-400 leading-relaxed">{card.sub}</p>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                    card.trendUp ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {card.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-neutral-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Sales Overview</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Last 30 days — revenue & order count
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F3460]" />
              <span className="text-neutral-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E94560]" />
              <span className="text-neutral-500">Orders</span>
            </div>
          </div>
        </div>
        {chartData.length > 0 ? (
          <SalesChart data={chartData} />
        ) : (
          <div className="h-72 flex flex-col items-center justify-center text-neutral-400">
            <TrendingUp className="h-10 w-10 text-neutral-200 mb-3" />
            <p className="text-sm font-medium">No order data yet</p>
            <p className="text-xs text-neutral-300 mt-1">Data will appear once orders come in</p>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">
        {/* Recent Orders - takes 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-5 lg:px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[#1A1A2E]">Recent Orders</h2>
                <p className="text-[11px] text-neutral-400">Latest customer orders</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#0F3460] hover:text-[#1A1A2E] font-semibold flex items-center gap-1 group transition-colors"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <ShoppingCart className="h-10 w-10 mx-auto text-neutral-200 mb-3" />
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs text-neutral-300 mt-1">Orders will appear here when customers check out</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50/60 text-neutral-500">
                  <tr>
                    <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Order</th>
                    <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Customer</th>
                    <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Items</th>
                    <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 lg:px-6 py-3.5">
                        <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 lg:px-6 py-3.5">
                        <div className="font-medium text-neutral-800 text-sm">{order.user.name || 'Unknown'}</div>
                        <div className="text-[11px] text-neutral-400">{order.user.email}</div>
                      </td>
                      <td className="px-5 lg:px-6 py-3.5 text-neutral-500 text-xs hidden md:table-cell">
                        {order.items.slice(0, 2).map((i) => i.product.name).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2}`}
                      </td>
                      <td className="px-5 lg:px-6 py-3.5 font-semibold text-neutral-800">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-5 lg:px-6 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions + Stats */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#0F3460]/5 to-transparent hover:from-[#0F3460]/10 border border-[#0F3460]/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0F3460]/10 flex items-center justify-center group-hover:bg-[#0F3460]/15 transition-colors">
                  <Package className="h-4 w-4 text-[#0F3460]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-800">Add Product</p>
                  <p className="text-[11px] text-neutral-400">Create new listing</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-[#0F3460] transition-colors" />
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/10 border border-amber-200/60 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-800">Manage Orders</p>
                  <p className="text-[11px] text-neutral-400">{stats?.pendingOrders || 0} pending</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-amber-600 transition-colors" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/5 to-transparent hover:from-violet-500/10 border border-violet-200/60 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-800">View Users</p>
                  <p className="text-[11px] text-neutral-400">{stats?.totalUsers || 0} registered</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-violet-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Order Status Breakdown */}
          {stats && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-4">Order Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Pending', count: stats.pendingOrders, total: stats.totalOrders, color: 'bg-amber-500' },
                  { label: 'Delivered', count: stats.deliveredOrders, total: stats.totalOrders, color: 'bg-emerald-500' },
                  { label: 'Other', count: stats.totalOrders - stats.pendingOrders - stats.deliveredOrders, total: stats.totalOrders, color: 'bg-blue-500' },
                ].map((item) => {
                  const pct = item.total > 0 ? (item.count / item.total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-neutral-600">{item.label}</span>
                        <span className="text-xs text-neutral-400">{item.count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
