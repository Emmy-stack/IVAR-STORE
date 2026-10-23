'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowDown, MessageCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { getSellAccountWhatsAppUrl } from '@/lib/whatsapp';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  videoUrl?: string | null;
  posterUrl?: string;
  videoEnabled?: boolean;
  whatsappNumber?: string;
}

export default function HeroSection({
  title = 'Find Your Next Legendary FF Account.',
  subtitle = 'Discover rare bundles, exclusive skins, and legendary collections.',
  videoUrl,
  posterUrl = '/images/hero-poster.jpg',
  videoEnabled = true,
  whatsappNumber,
}: HeroSectionProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const sellUrl = getSellAccountWhatsAppUrl(whatsappNumber);

  const scrollToAccounts = () => {
    const el = document.getElementById('accounts-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasVideo = videoEnabled && videoUrl && videoUrl.trim().length > 0;

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-[#1E2C4A]">
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {hasVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={posterUrl}
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-50' : 'opacity-0'
            }`}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : null}

        {/* Fallback & Base High-Impact Poster Image */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            hasVideo && videoLoaded ? 'opacity-30' : 'opacity-65'
          }`}
        >
          <Image
            src={posterUrl || '/images/hero-poster.jpg'}
            alt="Free Fire Hero Backdrop"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter saturate-125"
          />
        </div>

        {/* Cyber Dark Esports Gradients & Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-[#080D1A]/75 to-[#080D1A]/90" />
        <div className="absolute inset-0 bg-radial-glow opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Esports Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111A2E]/90 border border-[#00A3FF]/40 text-[#00A3FF] text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-[#00A3FF]/15 animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5 text-[#00A3FF]" />
          <span>Nigeria&apos;s #1 Verified Free Fire Marketplace</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
          {title.includes('Legendary FF Account') ? (
            <>
              Find Your Next <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563FF] via-[#00A3FF] to-white glow-text-cyan">
                Legendary FF Account.
              </span>
            </>
          ) : (
            title
          )}
        </h1>

        {/* Supporting Text */}
        <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
          {/* Primary CTA: Explore Accounts */}
          <button
            type="button"
            onClick={scrollToAccounts}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-extrabold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-xl shadow-[#00A3FF]/30 hover:shadow-[#00A3FF]/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Zap className="w-5 h-5 text-yellow-300" />
            <span>Explore Accounts</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          {/* Secondary CTA: Sell Your Account */}
          <a
            href={sellUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-slate-200 bg-[#111A2E]/90 hover:bg-[#1A2644] border border-[#1E2C4A] hover:border-[#00A3FF]/60 hover:text-white transition-all duration-300 shadow-lg shadow-black/40 hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Sell Your Account</span>
          </a>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-[#1E2C4A]/50 w-full max-w-3xl">
          <div className="flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg bg-[#111A2E]/50 border border-[#1E2C4A]/60 text-xs sm:text-sm font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
            <span>100% Legit & Verified</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg bg-[#111A2E]/50 border border-[#1E2C4A]/60 text-xs sm:text-sm font-semibold text-slate-300">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Escrow Transfer</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg bg-[#111A2E]/50 border border-[#1E2C4A]/60 text-xs sm:text-sm font-semibold text-slate-300">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Instant Access Handover</span>
          </div>
        </div>
      </div>
    </section>
  );
}
