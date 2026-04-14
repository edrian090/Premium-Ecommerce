'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Users, Search, Shield, ShieldOff, Trash2, AlertTriangle,
  ChevronLeft, ChevronRight, Mail, Calendar, ShoppingBag,
  UserCheck, Crown,
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'' | 'ADMIN' | 'USER'>('');

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const LIMIT = 20;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: LIMIT.toString() });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) { setUsers(data.users); setTotal(data.total); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
        showToast(`${user.name || user.email} is now ${newRole}`);
      } else {
        showToast(data.error || 'Failed to update role');
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setDeleteTarget(null);
        fetchUsers();
        showToast('User deleted successfully');
      } else {
        showToast(data.error || 'Failed to delete user');
        setDeleteTarget(null);
      }
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  // Filter by role client-side for the display
  const filteredUsers = roleFilter
    ? users.filter(u => u.role === roleFilter)
    : users;

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const userCount = users.filter(u => u.role === 'USER').length;

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
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Users</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} registered user{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1.5">
            <Crown className="h-3 w-3" />
            {adminCount} Admin{adminCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1.5">
            <UserCheck className="h-3 w-3" />
            {userCount} Customer{userCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
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

        {/* Role Filter */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 self-start">
          {[
            { label: 'All', value: '' },
            { label: 'Admins', value: 'ADMIN' },
            { label: 'Customers', value: 'USER' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === opt.value ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="w-10 h-10 border-4 border-[#0F3460]/20 rounded-full" />
              <div className="w-10 h-10 border-4 border-[#0F3460] border-t-transparent rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">Loading users…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-neutral-300" />
            </div>
            <p className="font-semibold text-neutral-600">No users found</p>
            <p className="text-sm text-neutral-400 mt-1.5">
              {search ? 'Try a different search term.' : 'Users will appear here when they register.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">User</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider">Role</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Orders</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-5 lg:px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F3460] to-[#1A1A2E] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 select-none overflow-hidden shadow-sm shadow-[#0F3460]/20">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (user.name || user.email || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                            {user.name || '—'}
                            {user.role === 'ADMIN' && (
                              <Crown className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200'
                          : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                      }`}>
                        {user.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-neutral-600 text-sm">
                        <ShoppingBag className="h-3.5 w-3.5 text-neutral-400" />
                        {user._count.orders} order{user._count.orders !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleRole(user)}
                          disabled={updatingId === user.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                            user.role === 'ADMIN'
                              ? 'text-amber-700 hover:bg-amber-50 border border-amber-200'
                              : 'text-violet-700 hover:bg-violet-50 border border-violet-200'
                          }`}
                          title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          {updatingId === user.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : user.role === 'ADMIN' ? (
                            <><ShieldOff className="h-3.5 w-3.5" /> Demote</>
                          ) : (
                            <><Shield className="h-3.5 w-3.5" /> Promote</>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            Showing <span className="font-semibold text-neutral-700">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> of <span className="font-semibold text-neutral-700">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors text-sm font-medium">
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="text-sm font-medium text-neutral-700">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors text-sm font-medium">
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 text-center">Delete User</h3>
            <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
              Delete <span className="font-semibold text-neutral-700">{deleteTarget.name || deleteTarget.email}</span>?
              All their orders, reviews, and data will be permanently removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                Cancel
              </button>
              <button onClick={deleteUser} disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
