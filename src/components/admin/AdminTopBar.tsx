'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
};

interface AdminTopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AdminTopBar({ user }: AdminTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotif, setHasNotif] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/admin/orders?limit=1');
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          const latestId = data.orders[0].id;
          if (pathname === '/admin/orders') {
            localStorage.setItem('last_seen_order', latestId);
            setHasNotif(false);
          } else {
            if (localStorage.getItem('last_seen_order') !== latestId) {
              setHasNotif(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLatest();
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const breadcrumbs = pathname.split('/').filter(Boolean);
  const currentPage = BREADCRUMB_MAP[pathname] || breadcrumbs[breadcrumbs.length - 1] || 'Dashboard';

  return (
    <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 flex items-center px-4 sm:px-6 lg:px-8 gap-4 sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
        <Link href="/admin" className="text-neutral-400 hover:text-[#0F3460] transition-colors hidden sm:inline">
          Admin
        </Link>
        <span className="text-neutral-300 hidden sm:inline">/</span>
        <span className="font-semibold text-[#1A1A2E] truncate">{currentPage}</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className={`${showSearch ? 'flex' : 'hidden sm:flex'} items-center relative transition-all`}>
        <Search className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products…"
          className="pl-9 pr-4 py-2 rounded-xl bg-neutral-100/80 border border-transparent text-sm w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460]/30 focus:bg-white transition-all placeholder:text-neutral-400"
        />
        {showSearch && (
          <button type="button" onClick={() => setShowSearch(false)} className="ml-2 sm:hidden p-1 text-neutral-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <button
        onClick={() => setShowSearch(true)}
        className="sm:hidden p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Notifications */}
      <Link href="/admin/orders" title="View latest orders">
        <button className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all">
          <Bell className="h-5 w-5" />
          {hasNotif && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E94560] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>
      </Link>

      {/* Divider */}
      <div className="w-px h-8 bg-neutral-200 hidden sm:block" />

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F3460] to-[#1A1A2E] flex items-center justify-center text-white text-sm font-bold select-none shadow-md shadow-[#0F3460]/20 overflow-hidden">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            (user.name || user.email || 'A')[0].toUpperCase()
          )}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-neutral-800 leading-tight">
            {user.name || 'Admin'}
          </p>
          <p className="text-xs text-neutral-400 leading-tight">Administrator</p>
        </div>
      </div>
    </div>
  );
}
