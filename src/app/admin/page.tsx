import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/services/account-service';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatNaira } from '@/lib/whatsapp';
import {
  Layers,
  CheckCircle2,
  Clock,
  Lock,
  PlusCircle,
  Database,
  ArrowRight,
  Sparkles,
  Video,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [stats, isSupabaseActive] = await Promise.all([
    getDashboardStats(),
    Promise.resolve(isSupabaseConfigured()),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Top Welcome & Database Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2C4A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time Free Fire inventory metrics and store configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Status Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111A2E] border border-[#1E2C4A] text-xs">
            <Database className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span className="text-slate-400">Database:</span>
            {isSupabaseActive ? (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Supabase Connected
              </span>
            ) : (
              <span className="font-semibold text-yellow-400 flex items-center gap-1" title="Configure .env.local with Supabase credentials for cloud hosting">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                Local File DB
              </span>
            )}
          </div>

          <Link
            href="/admin/accounts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Account</span>
          </Link>
        </div>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Listings */}
        <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Listings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#00A3FF]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.totalListings}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across all statuses
          </span>
        </div>

        {/* Available Accounts */}
        <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {stats.availableCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ready for purchase
          </span>
        </div>

        {/* Reserved Accounts */}
        <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reserved
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {stats.reservedCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            In escrow negotiation
          </span>
        </div>

        {/* Sold Accounts */}
        <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sold
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">
            {stats.soldCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Successfully delivered
          </span>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/accounts"
          className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] hover:border-[#00A3FF]/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#00A3FF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00A3FF] transition-colors">
                Manage Accounts
              </h4>
              <p className="text-[11px] text-[#94A3B8]">Edit, change status, or delete</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/hero"
          className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] hover:border-[#00A3FF]/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Hero Video Settings
              </h4>
              <p className="text-[11px] text-[#94A3B8]">Upload video, poster & text</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/contact"
          className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] hover:border-[#00A3FF]/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Contact Settings
              </h4>
              <p className="text-[11px] text-[#94A3B8]">WhatsApp & Telegram numbers</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* Recently Added Accounts Table */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] overflow-hidden">
        <div className="p-5 border-b border-[#1E2C4A] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recently Added Accounts</h3>
            <p className="text-xs text-[#94A3B8]">Latest Free Fire accounts added to the marketplace</p>
          </div>
          <Link
            href="/admin/accounts"
            className="text-xs font-semibold text-[#00A3FF] hover:text-white transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080D1A] text-slate-400 uppercase font-semibold border-b border-[#1E2C4A]">
              <tr>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Rank / Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C4A]">
              {stats.recentAdded.map(acc => (
                <tr key={acc.id} className="hover:bg-[#16233F]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-[#00A3FF]">
                    {acc.product_id}
                  </td>
                  <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                    {acc.title}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {formatNaira(acc.price)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {acc.rank || '—'} {acc.level ? `(Lv. ${acc.level})` : ''}
                  </td>
                  <td className="py-3 px-4">
                    {acc.status === 'available' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                        Available
                      </span>
                    )}
                    {acc.status === 'reserved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/80 text-amber-400 border border-amber-500/40">
                        Reserved
                      </span>
                    )}
                    {acc.status === 'sold' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-500/40">
                        Sold
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {acc.published ? (
                      <span className="text-emerald-400 font-semibold">Published</span>
                    ) : (
                      <span className="text-slate-500">Draft</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/accounts/${acc.slug}`}
                        target="_blank"
                        className="p-1 text-slate-400 hover:text-white"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/accounts/${acc.id}/edit`}
                        className="text-xs font-semibold text-[#00A3FF] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
