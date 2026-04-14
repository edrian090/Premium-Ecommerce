'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronRight,
  Store,
  LogOut,
  Menu,
  X,
  BarChart3,
  Ticket,
  MessageSquare,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Feedback', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Vouchers', href: '/admin/vouchers', icon: Ticket },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-[#E94560] to-[#c9374e] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#E94560]/30">
          <Store className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight tracking-tight">Admin Panel</p>
          <p className="text-[11px] text-white/40 leading-tight">Control Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest px-3 py-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? 'bg-gradient-to-r from-[#E94560] to-[#d63d57] text-white shadow-lg shadow-[#E94560]/25'
                  : 'text-white/55 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
                active ? 'text-white' : 'text-white/45 group-hover:text-white'
              }`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}

        {/* Analytics Section */}
        <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest px-3 py-2 mt-4">
          Analytics
        </p>
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white transition-all duration-200 group"
        >
          <BarChart3 className="h-[18px] w-[18px] flex-shrink-0 text-white/45 group-hover:text-white transition-colors" />
          <span className="flex-1">Sales Report</span>
        </Link>
        <Link
          href="/admin/product-performance"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white transition-all duration-200 group"
        >
          <BarChart3 className="h-[18px] w-[18px] flex-shrink-0 text-white/45 group-hover:text-white transition-colors" />
          <span className="flex-1">Product Tracking</span>
        </Link>
      </nav>

      {/* Bottom - Sign Out */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1A2E] text-white rounded-xl shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#1A1A2E] text-white flex flex-col transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-[260px] bg-[#1A1A2E] text-white flex-col min-h-screen hidden md:flex flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
