import Link from 'next/link';
import { Flame, MessageCircle, Send, ShieldCheck, Zap, Lock } from 'lucide-react';
import { getSellAccountWhatsAppUrl } from '@/lib/whatsapp';

interface FooterProps {
  whatsappNumber?: string;
  telegramNumber?: string;
  telegramUrl?: string;
}

export default function Footer({
  whatsappNumber = '07041545267',
  telegramNumber = '07047673903',
  telegramUrl = 'https://t.me/ivarstore',
}: FooterProps) {
  const sellUrl = getSellAccountWhatsAppUrl(whatsappNumber);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#050811] border-t border-[#1E2C4A] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#2563FF]/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563FF] to-[#00A3FF] flex items-center justify-center p-[2px]">
                <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#00A3FF]" />
                </div>
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                IVAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563FF] to-[#00A3FF]">STORE</span>
              </span>
            </Link>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Nigeria&apos;s premier marketplace for authentic Free Fire accounts. Rare bundles, max evo guns, and top-tier competitive accounts with 100% secure WhatsApp escrow delivery.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Escrow & Fast Handover</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00A3FF]" /> Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#accounts-section" className="hover:text-white transition-colors">
                  Available Accounts
                </Link>
              </li>
              <li>
                <Link href="/#contact-section" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <a
                  href={sellUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00A3FF] transition-colors"
                >
                  Sell Your FF Account
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Direct Contact
            </h4>
            <ul className="space-y-3 text-sm text-[#94A3B8]">
              <li>
                <a
                  href={`https://wa.me/234${whatsappNumber.replace(/^0+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">WhatsApp</span>
                    <span className="font-mono text-white text-xs">{whatsappNumber}</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-sky-400 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Telegram</span>
                    <span className="font-mono text-white text-xs">{telegramNumber}</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* Sell CTA Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Instant Cash for Your Account
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Looking to cash out your Free Fire collection? We buy authentic accounts with fast payment and transparent evaluation.
            </p>
            <a
              href={sellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/20 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Want to Sell Your Account?</span>
            </a>
          </div>
        </div>

        {/* Bottom separator and legal / admin link */}
        <div className="border-t border-[#1E2C4A]/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} IVAR STORE. All rights reserved. Free Fire is a registered trademark of Garena.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#00A3FF] transition-colors font-medium"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
