'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Account } from '@/types';
import { formatNaira, getBuyAccountWhatsAppUrl, getSellAccountWhatsAppUrl } from '@/lib/whatsapp';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MessageCircle,
  ShieldCheck,
  Zap,
  Lock,
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';

interface AccountDetailViewProps {
  account: Account;
  whatsappNumber?: string;
}

export default function AccountDetailView({
  account,
  whatsappNumber = '07041545267',
}: AccountDetailViewProps) {
  const images = account.images && account.images.length > 0
    ? account.images.map(img => img.storage_path)
    : ['/images/sample-acc-1.jpg'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAvailable = account.status === 'available';
  const isReserved = account.status === 'reserved';
  const isSold = account.status === 'sold';

  // Dynamic WhatsApp buy link
  const buyWhatsAppUrl = getBuyAccountWhatsAppUrl({
    productId: account.product_id,
    title: account.title,
    price: account.price,
    phoneNumber: whatsappNumber,
  });

  const sellWhatsAppUrl = getSellAccountWhatsAppUrl(whatsappNumber);

  // Gallery Navigation
  const prevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard controls for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/#accounts-section"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Accounts</span>
          </Link>

          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A2E] border border-[#1E2C4A] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Account'}</span>
          </button>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image Stage */}
            <div className="relative aspect-video w-full rounded-2xl bg-[#080D1A] border border-[#1E2C4A] overflow-hidden group shadow-2xl">
              <Image
                src={images[activeImageIndex]}
                alt={`${account.title} - Screenshot ${activeImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Prev / Next controls on image */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity border border-white/20"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity border border-white/20"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Zoom Button & Index Pill */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-black/70 text-[11px] font-mono text-slate-200 border border-white/10 backdrop-blur-md">
                  {activeImageIndex + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="p-2 rounded-md bg-black/70 hover:bg-black text-white border border-white/10 backdrop-blur-md transition-colors"
                  aria-label="Open fullscreen gallery"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation Track */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#00A3FF] shadow-lg shadow-[#00A3FF]/30 scale-105'
                        : 'border-[#1E2C4A] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={imgSrc}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Security Promise Box */}
            <div className="rounded-2xl bg-[#111A2E]/70 border border-[#1E2C4A] p-5 mt-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">IVAR STORE Buyer Protection</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                    All accounts undergo email cleanup and full verification before transfer. Handover occurs directly in WhatsApp with credentials tested live before final confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Account Info, Pricing, Buy CTA (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Product ID & Status Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#00A3FF] bg-[#00A3FF]/10 px-3 py-1 rounded-lg border border-[#00A3FF]/30">
                    {account.product_id}
                  </span>
                  {account.featured && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/30">
                      <Sparkles className="w-3 h-3 fill-amber-300" /> Featured
                    </span>
                  )}
                </div>

                {/* Availability status badge */}
                <div>
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available
                    </span>
                  )}
                  {isReserved && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Reserved
                    </span>
                  )}
                  {isSold && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Sold
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {account.title}
              </h1>

              {/* Price Display */}
              <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C4A]">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Fixed Price (NGN)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatNaira(account.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    (No hidden charges)
                  </span>
                </div>
              </div>

              {/* Quick Spec Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C4A] text-center">
                  <span className="block text-[11px] text-slate-400">Level</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {account.level || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C4A] text-center">
                  <span className="block text-[11px] text-slate-400">Rank</span>
                  <span className="text-lg font-bold text-amber-300">
                    {account.rank || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C4A] text-center">
                  <span className="block text-[11px] text-slate-400">Skins</span>
                  <span className="text-lg font-bold font-mono text-[#00A3FF]">
                    {account.skin_count || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C4A] text-center">
                  <span className="block text-[11px] text-slate-400">Bundles</span>
                  <span className="text-lg font-bold font-mono text-purple-400">
                    {account.bundle_count || 0}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Buy Now on WhatsApp */}
              <div className="space-y-3 pt-2">
                {isAvailable ? (
                  <a
                    href={buyWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-base font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span>Buy Now on WhatsApp</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-base font-bold text-slate-400 bg-[#1E293B] cursor-not-allowed border border-slate-700 opacity-80"
                  >
                    <Lock className="w-5 h-5" />
                    <span>
                      {isReserved ? 'Account Currently Reserved' : 'Account Already Sold'}
                    </span>
                  </button>
                )}

                <a
                  href={sellWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-slate-300 bg-[#111A2E] hover:bg-[#1A2644] border border-[#1E2C4A] hover:border-[#00A3FF]/40 transition-colors"
                >
                  <Zap className="w-4 h-4 text-[#00A3FF]" />
                  <span>Have an account to sell instead? Tap here</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Sections: Skins, Bundles, Weapons, Description */}
        <div className="mt-14 pt-10 border-t border-[#1E2C4A] grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Detailed Description (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Account Overview & Description</h3>
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A] text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {account.description || 'No additional description provided.'}
              </div>
            </div>

            {/* Rare Weapons Arsenal */}
            {account.weapons && account.weapons.length > 0 && (
              <div>
                <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Featured Weapons & Evo Guns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {account.weapons.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-[#111A2E] border border-[#1E2C4A] text-xs font-semibold text-slate-200"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emotes */}
            {account.emotes && account.emotes.length > 0 && (
              <div>
                <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00A3FF]" /> Rare Emotes Collection
                </h4>
                <div className="flex flex-wrap gap-2">
                  {account.emotes.map((e, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-[#111A2E] border border-[#1E2C4A] text-xs font-semibold text-cyan-200"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column Breakdown: Rare Skins & Bundles (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rare Skins */}
            {account.rare_skins && account.rare_skins.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A]">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
                  Rare Skins & Attributes
                </h4>
                <ul className="space-y-2.5">
                  {account.rare_skins.map((skin, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]" />
                      <span>{skin}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rare Bundles */}
            {account.rare_bundles && account.rare_bundles.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A]">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
                  Rare Bundles & Outfits
                </h4>
                <ul className="space-y-2.5">
                  {account.rare_bundles.map((bundle, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-purple-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>{bundle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {account.tags && account.tags.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#111A2E] border border-[#1E2C4A]">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Account Badges & Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {account.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#080D1A] border border-[#1E2C4A] text-[11px] font-medium text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in-50"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 z-50 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Main Lightbox Image */}
          <div
            className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeImageIndex]}
              alt={`Fullscreen ${account.title} Screenshot`}
              fill
              className="object-contain"
            />
          </div>

          {/* Lightbox Footer info */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 text-xs font-mono text-white border border-white/20">
            {activeImageIndex + 1} of {images.length} • {account.product_id}
          </div>
        </div>
      )}
    </div>
  );
}
