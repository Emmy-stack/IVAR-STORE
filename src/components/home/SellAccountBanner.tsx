import { MessageCircle, DollarSign, ShieldCheck, Zap } from 'lucide-react';
import { getSellAccountWhatsAppUrl } from '@/lib/whatsapp';

interface SellAccountBannerProps {
  whatsappNumber?: string;
}

export default function SellAccountBanner({ whatsappNumber }: SellAccountBannerProps) {
  const sellUrl = getSellAccountWhatsAppUrl(whatsappNumber);

  return (
    <section className="w-full py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#111A2E] via-[#16233F] to-[#111A2E] border border-[#2563FF]/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
          {/* Background Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00A3FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#2563FF]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A3FF]/10 border border-[#00A3FF]/30 text-[#00A3FF] text-xs font-bold uppercase tracking-wider mb-4">
                <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
                <span>Instant Cash Payout</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Want to Sell Your Free Fire Account?
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6">
                Turn your high-tier skins, OG bundles, and max evo guns into immediate cash. We evaluate your account transparently and complete safe transactions with instant bank transfers.
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fair Market Valuation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant Naira Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#00A3FF]" />
                  <span>1-on-1 Escrow Chat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href={sellUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-extrabold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-xl shadow-[#00A3FF]/30 hover:shadow-[#00A3FF]/50 transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>Want to Sell Your Account?</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
