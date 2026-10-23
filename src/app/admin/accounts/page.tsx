'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Account, AccountStatus } from '@/types';
import { formatNaira } from '@/lib/whatsapp';
import {
  PlusCircle,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Filter,
} from 'lucide-react';

export default function AdminManageAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModalAccount, setDeleteModalAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch accounts
  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Change Handler
  const handleStatusChange = async (account: Account, newStatus: AccountStatus) => {
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: { status: newStatus },
        }),
      });

      if (res.ok) {
        setAccounts(prev =>
          prev.map(a => (a.id === account.id ? { ...a, status: newStatus } : a))
        );
        showToast('success', `Status updated to ${newStatus}`);
      } else {
        showToast('error', 'Failed to update status');
      }
    } catch {
      showToast('error', 'Error updating status');
    }
  };

  // Toggle Featured Handler
  const handleToggleFeatured = async (account: Account) => {
    const nextFeatured = !account.featured;
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: { featured: nextFeatured },
        }),
      });

      if (res.ok) {
        setAccounts(prev =>
          prev.map(a => (a.id === account.id ? { ...a, featured: nextFeatured } : a))
        );
        showToast('success', nextFeatured ? 'Marked as Featured' : 'Unmarked from Featured');
      }
    } catch {
      showToast('error', 'Failed to update featured flag');
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteModalAccount) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/accounts/${deleteModalAccount.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAccounts(prev => prev.filter(a => a.id !== deleteModalAccount.id));
        showToast('success', `Account ${deleteModalAccount.product_id} deleted successfully`);
        setDeleteModalAccount(null);
      } else {
        showToast('error', 'Failed to delete account');
      }
    } catch {
      showToast('error', 'Error deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered accounts
  const filtered = accounts.filter(acc => {
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        acc.title.toLowerCase().includes(q) ||
        acc.product_id.toLowerCase().includes(q) ||
        acc.rank.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2C4A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manage Accounts
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            View, filter, update availability, or edit Free Fire listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAccounts}
            className="p-2.5 rounded-xl bg-[#111A2E] border border-[#1E2C4A] text-slate-400 hover:text-white"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/accounts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Account</span>
          </Link>
        </div>
      </div>

      {/* Controls: Search and Status Filter */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, ID, rank..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00A3FF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs text-slate-200 focus:outline-none focus:border-[#00A3FF]"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="reserved">Reserved Only</option>
            <option value="sold">Sold Only</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080D1A] text-slate-400 uppercase font-semibold border-b border-[#1E2C4A]">
              <tr>
                <th className="py-3.5 px-4">Thumbnail</th>
                <th className="py-3.5 px-4">Product ID</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C4A]">
              {filtered.map(acc => {
                const thumb =
                  acc.images?.find(i => i.is_primary)?.storage_path ||
                  acc.images?.[0]?.storage_path ||
                  '/images/sample-acc-1.jpg';

                return (
                  <tr key={acc.id} className="hover:bg-[#16233F]/40 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-14 h-9 rounded-lg overflow-hidden bg-black border border-[#1E2C4A]">
                        <Image
                          src={thumb}
                          alt={acc.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* Product ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#00A3FF]">
                      {acc.product_id}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate" title={acc.title}>
                      {acc.title}
                      {!acc.published && (
                        <span className="ml-2 text-[10px] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {formatNaira(acc.price)}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={acc.status}
                        onChange={e => handleStatusChange(acc, e.target.value as AccountStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          acc.status === 'available'
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                            : acc.status === 'reserved'
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                        }`}
                      >
                        <option value="available" className="bg-[#080D1A] text-emerald-400">
                          Available
                        </option>
                        <option value="reserved" className="bg-[#080D1A] text-amber-400">
                          Reserved
                        </option>
                        <option value="sold" className="bg-[#080D1A] text-rose-400">
                          Sold
                        </option>
                      </select>
                    </td>

                    {/* Featured Status Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(acc)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          acc.featured
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-[#080D1A] border-[#1E2C4A] text-slate-600 hover:text-slate-400'
                        }`}
                        title={acc.featured ? 'Featured on homepage' : 'Not featured'}
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(acc.created_at).toLocaleDateString('en-GB')}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/accounts/${acc.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2C4A]"
                          title="Preview Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/admin/accounts/${acc.id}/edit`}
                          className="p-1.5 rounded-lg text-[#00A3FF] hover:bg-[#00A3FF]/10"
                          title="Edit Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteModalAccount(acc)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Account Listing?</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white font-mono">
                {deleteModalAccount.product_id}
              </strong>{' '}
              ({deleteModalAccount.title})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalAccount(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#16233F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
