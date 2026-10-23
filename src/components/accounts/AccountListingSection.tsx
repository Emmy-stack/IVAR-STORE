'use client';

import { useState, useMemo } from 'react';
import { Account, AccountRank } from '@/types';
import AccountCard from './AccountCard';
import { Search, SlidersHorizontal, X, RotateCcw, Flame, ShieldAlert } from 'lucide-react';
import { FF_RANKS } from '@/lib/constants';

interface AccountListingSectionProps {
  initialAccounts: Account[];
}

export default function AccountListingSection({ initialAccounts }: AccountListingSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minLevel, setMinLevel] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price_asc' | 'price_desc'>('featured');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Clear all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRank('all');
    setMinPrice('');
    setMaxPrice('');
    setMinLevel('');
    setSortBy('featured');
    setShowOnlyAvailable(false);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedRank !== 'all' ||
      minPrice !== '' ||
      maxPrice !== '' ||
      minLevel !== '' ||
      showOnlyAvailable
    );
  }, [searchQuery, selectedRank, minPrice, maxPrice, minLevel, showOnlyAvailable]);

  // Client-side filtering & sorting
  const filteredAccounts = useMemo(() => {
    let list = [...initialAccounts];

    // Status filter
    if (showOnlyAvailable) {
      list = list.filter(acc => acc.status === 'available');
    }

    // Rank filter
    if (selectedRank !== 'all') {
      list = list.filter(acc => acc.rank?.toLowerCase() === selectedRank.toLowerCase());
    }

    // Min price
    if (minPrice && !isNaN(Number(minPrice))) {
      list = list.filter(acc => acc.price >= Number(minPrice));
    }

    // Max price
    if (maxPrice && !isNaN(Number(maxPrice))) {
      list = list.filter(acc => acc.price <= Number(maxPrice));
    }

    // Min Level
    if (minLevel && !isNaN(Number(minLevel))) {
      list = list.filter(acc => (acc.level || 0) >= Number(minLevel));
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(acc => {
        return (
          acc.title.toLowerCase().includes(q) ||
          acc.product_id.toLowerCase().includes(q) ||
          (acc.description && acc.description.toLowerCase().includes(q)) ||
          (acc.rank && acc.rank.toLowerCase().includes(q)) ||
          (acc.level && acc.level.toString().includes(q)) ||
          (acc.tags && acc.tags.some(t => t.toLowerCase().includes(q))) ||
          (acc.rare_skins && acc.rare_skins.some(s => s.toLowerCase().includes(q))) ||
          (acc.rare_bundles && acc.rare_bundles.some(b => b.toLowerCase().includes(q))) ||
          (acc.emotes && acc.emotes.some(e => e.toLowerCase().includes(q))) ||
          (acc.weapons && acc.weapons.some(w => w.toLowerCase().includes(q)))
        );
      });
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // featured
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return list;
  }, [initialAccounts, searchQuery, selectedRank, minPrice, maxPrice, minLevel, sortBy, showOnlyAvailable]);

  return (
    <section id="accounts-section" className="w-full py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A3FF] mb-2">
              <Flame className="w-4 h-4 text-[#00A3FF]" />
              <span>Current Inventory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Available FF Accounts
            </h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Browse verified Free Fire accounts with high tier skins, max evo guns, and Grandmaster ranks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#111A2E] border border-[#1E2C4A] text-slate-300">
              <strong className="text-white font-bold">{filteredAccounts.length}</strong> {filteredAccounts.length === 1 ? 'Account' : 'Accounts'} Found
            </span>
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
          <button
            type="button"
            onClick={resetFilters}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              !hasActiveFilters
                ? 'bg-gradient-to-r from-[#2563FF] to-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
                : 'bg-[#111A2E] text-slate-400 hover:text-white border border-[#1E2C4A]'
            }`}
          >
            🔥 All Accounts
          </button>
          <button
            type="button"
            onClick={() => { resetFilters(); setSelectedRank('Grandmaster'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedRank === 'Grandmaster'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                : 'bg-[#111A2E] text-slate-300 hover:text-white border border-[#1E2C4A]'
            }`}
          >
            👑 Grandmaster
          </button>
          <button
            type="button"
            onClick={() => { resetFilters(); setSelectedRank('Master'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedRank === 'Master'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#111A2E] text-slate-300 hover:text-white border border-[#1E2C4A]'
            }`}
          >
            ⭐ Master Rank
          </button>
          <button
            type="button"
            onClick={() => { resetFilters(); setSearchQuery('Draco'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              searchQuery === 'Draco'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-[#111A2E] text-slate-300 hover:text-white border border-[#1E2C4A]'
            }`}
          >
            ⚡ Max Evo Draco
          </button>
          <button
            type="button"
            onClick={() => { resetFilters(); setSearchQuery('Sakura'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              searchQuery === 'Sakura'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-[#111A2E] text-slate-300 hover:text-white border border-[#1E2C4A]'
            }`}
          >
            🌸 Season 1 Sakura
          </button>
          <button
            type="button"
            onClick={() => { resetFilters(); setMaxPrice('70000'); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              maxPrice === '70000'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#111A2E] text-slate-300 hover:text-white border border-[#1E2C4A]'
            }`}
          >
            💸 Under ₦70,000
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-4 sm:p-5 mb-8 shadow-xl">
          {/* Top Search & Filter Toggle Row */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, ID (e.g. IVAR-FF-0001), weapon, bundle, or skin..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Rank Select */}
            <div className="w-full md:w-44">
              <select
                value={selectedRank}
                onChange={e => setSelectedRank(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-slate-200 focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="all">All Ranks</option>
                {FF_RANKS.map(rank => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-slate-200 focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Filter Toggle Button for Advanced Filters */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                isFilterDrawerOpen || hasActiveFilters
                  ? 'bg-[#2563FF]/20 border-[#00A3FF] text-[#00A3FF]'
                  : 'bg-[#080D1A] border-[#1E2C4A] text-slate-300 hover:border-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters Expandable Panel */}
          {isFilterDrawerOpen && (
            <div className="mt-4 pt-4 border-t border-[#1E2C4A] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Min Price (₦)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#080D1A] border border-[#1E2C4A] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00A3FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Max Price (₦)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#080D1A] border border-[#1E2C4A] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00A3FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Min Level
                </label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={minLevel}
                  onChange={e => setMinLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#080D1A] border border-[#1E2C4A] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00A3FF]"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="inline-flex items-center gap-2 cursor-pointer pt-3 sm:pt-0">
                  <input
                    type="checkbox"
                    checked={showOnlyAvailable}
                    onChange={e => setShowOnlyAvailable(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#080D1A] border-[#1E2C4A] text-[#2563FF] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    Show Available Only
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Active Filter Chips & Reset */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-[#1E2C4A]/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">Filtered by:</span>
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E2C4A] text-slate-200">
                    Keyword: &quot;{searchQuery}&quot;
                  </span>
                )}
                {selectedRank !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E2C4A] text-slate-200">
                    Rank: {selectedRank}
                  </span>
                )}
                {minPrice && (
                  <span className="px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E2C4A] text-slate-200">
                    Min ₦{Number(minPrice).toLocaleString()}
                  </span>
                )}
                {maxPrice && (
                  <span className="px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E2C4A] text-slate-200">
                    Max ₦{Number(maxPrice).toLocaleString()}
                  </span>
                )}
                {minLevel && (
                  <span className="px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E2C4A] text-slate-200">
                    Lv. {minLevel}+
                  </span>
                )}
                {showOnlyAvailable && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    Available Only
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A3FF] hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#080D1A] border border-[#1E2C4A] flex items-center justify-center mx-auto mb-4 text-[#00A3FF]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Accounts Found</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              We couldn&apos;t find any accounts matching your current search criteria. Try removing some filters or search for another term.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
