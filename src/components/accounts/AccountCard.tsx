import Link from 'next/link';
import Image from 'next/image';
import { Account } from '@/types';
import { formatNaira } from '@/lib/whatsapp';
import { Award, Eye, Shield, Sparkles } from 'lucide-react';

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({ account }: AccountCardProps) {
  // Find primary image or first available image or fallback
  const primaryImage =
    account.images?.find(img => img.is_primary)?.storage_path ||
    account.images?.[0]?.storage_path ||
    '/images/sample-acc-1.jpg';

  const isAvailable = account.status === 'available';
  const isReserved = account.status === 'reserved';
  const isSold = account.status === 'sold';

  // Rank badge styling
  const rank = account.rank || 'Unranked';
  const getRankBadgeClass = () => {
    switch (rank.toLowerCase()) {
      case 'grandmaster':
        return 'bg-gradient-to-r from-red-600/30 to-amber-500/30 border-red-500/50 text-amber-300';
      case 'master':
        return 'bg-gradient-to-r from-purple-600/30 to-pink-500/30 border-purple-500/50 text-purple-200';
      case 'heroic':
        return 'bg-gradient-to-r from-red-700/30 to-rose-500/30 border-rose-500/50 text-rose-300';
      case 'diamond':
        return 'bg-gradient-to-r from-cyan-600/30 to-blue-500/30 border-cyan-500/50 text-cyan-200';
      default:
        return 'bg-[#111A2E] border-[#1E2C4A] text-slate-300';
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#111A2E] border border-[#1E2C4A] overflow-hidden hover:border-[#00A3FF]/60 hover:shadow-xl hover:shadow-[#00A3FF]/15 transition-all duration-300 hover:-translate-y-1">
      {/* Featured Ribbon */}
      {account.featured && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
          <Sparkles className="w-3 h-3 fill-black" />
          <span>Featured</span>
        </div>
      )}

      {/* Availability Status Badge */}
      <div className="absolute top-3 right-3 z-20">
        {isAvailable && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        )}
        {isReserved && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Reserved
          </span>
        )}
        {isSold && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Sold
          </span>
        )}
      </div>

      {/* Thumbnail Container */}
      <Link href={`/accounts/${account.slug}`} className="relative aspect-video w-full overflow-hidden bg-black/50 block">
        <Image
          src={primaryImage}
          alt={account.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 filter saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111A2E] via-transparent to-black/30 opacity-80" />

        {/* Level and Rank Badges on image footer */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-semibold">
          <span className={`px-2 py-0.5 rounded border text-[11px] font-bold backdrop-blur-md ${getRankBadgeClass()}`}>
            {rank}
          </span>
          {account.level && (
            <span className="px-2 py-0.5 rounded bg-black/70 border border-slate-700 text-slate-200 text-[11px] font-mono">
              Lv. {account.level}
            </span>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Product ID and Quick Meta */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <span className="font-mono text-[11px] font-semibold text-[#00A3FF] bg-[#00A3FF]/10 px-2 py-0.5 rounded border border-[#00A3FF]/20">
            {account.product_id}
          </span>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            {account.skin_count > 0 && <span>{account.skin_count} Skins</span>}
            {account.bundle_count > 0 && <span>• {account.bundle_count} Bundles</span>}
          </div>
        </div>

        {/* Title */}
        <Link href={`/accounts/${account.slug}`} className="block group-hover:text-[#00A3FF] transition-colors">
          <h3 className="text-base font-bold text-white line-clamp-2 leading-snug mb-3">
            {account.title}
          </h3>
        </Link>

        {/* Key Highlights / Rare Items Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(account.rare_skins && account.rare_skins.length > 0
            ? account.rare_skins.slice(0, 2)
            : account.tags.slice(0, 2)
          ).map((item, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-300 bg-[#080D1A] px-2 py-0.5 rounded border border-[#1E2C4A] truncate max-w-[140px]"
            >
              {item}
            </span>
          ))}
          {((account.rare_skins?.length || 0) + (account.tags?.length || 0)) > 2 && (
            <span className="text-[10px] font-medium text-slate-400 bg-[#080D1A] px-1.5 py-0.5 rounded border border-[#1E2C4A]">
              +more
            </span>
          )}
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-auto pt-4 border-t border-[#1E2C4A]/70 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
              Price
            </span>
            <span className="text-xl font-black text-white tracking-tight">
              {formatNaira(account.price)}
            </span>
          </div>

          <Link
            href={`/accounts/${account.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-md shadow-[#2563FF]/20 group-hover:shadow-[#00A3FF]/30 transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
