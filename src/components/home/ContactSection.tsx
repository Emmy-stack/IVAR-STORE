import { MessageCircle, Send, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface ContactSectionProps {
  whatsappNumber?: string;
  telegramNumber?: string;
  telegramUrl?: string;
}

export default function ContactSection({
  whatsappNumber = '07041545267',
  telegramNumber = '07047673903',
  telegramUrl = 'https://t.me/ivarstore',
}: ContactSectionProps) {
  const normalizedWhatsApp = normalizeWhatsAppNumber(whatsappNumber);
  const whatsappUrl = `https://wa.me/${normalizedWhatsApp}`;

  return (
    <section id="contact-section" className="w-full py-16 border-t border-[#1E2C4A] scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00A3FF] mb-2">
            <MessageCircle className="w-4 h-4 text-[#00A3FF]" />
            <span>Customer Support & Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact IVAR STORE
          </h2>
          <p className="text-sm text-[#94A3B8] mt-2">
            Reach out directly on WhatsApp or Telegram to ask questions, request video verification of any account, or get escrow guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* WhatsApp Card */}
          <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 sm:p-8 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Fastest Response
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">WhatsApp Official</h3>
              <p className="text-xs text-[#94A3B8] mb-4">
                Primary channel for account purchases, identity verification, screenshots, and live escrow handover.
              </p>

              <div className="font-mono text-lg font-bold text-white mb-6 bg-[#080D1A] px-4 py-3 rounded-xl border border-[#1E2C4A] flex items-center justify-between">
                <span>{whatsappNumber}</span>
                <span className="text-xs font-sans text-slate-400">Nigeria</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/25 transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Telegram Card */}
          <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 sm:p-8 hover:border-[#00A3FF]/50 hover:shadow-xl hover:shadow-[#00A3FF]/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00A3FF]/10 border border-[#00A3FF]/20 flex items-center justify-center text-[#00A3FF]">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A3FF] bg-[#00A3FF]/10 px-2.5 py-1 rounded-full border border-[#00A3FF]/20">
                  Telegram Channel
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Telegram Direct</h3>
              <p className="text-xs text-[#94A3B8] mb-4">
                Alternative direct messaging channel for account inquiries, deals, and community announcements.
              </p>

              <div className="font-mono text-lg font-bold text-white mb-6 bg-[#080D1A] px-4 py-3 rounded-xl border border-[#1E2C4A] flex items-center justify-between">
                <span>{telegramNumber}</span>
                <span className="text-xs font-sans text-slate-400">Telegram</span>
              </div>
            </div>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/25 transition-all duration-200"
            >
              <Send className="w-4 h-4" />
              <span>Open Telegram Contact</span>
            </a>
          </div>
        </div>

        {/* Security & Guarantees Box */}
        <div className="rounded-2xl bg-[#111A2E]/60 border border-[#1E2C4A] p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">100% Escrow & Legit Handover Policy</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Every account has its email and phone binds verified before listing. Handover is conducted live with full login proof.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00A3FF]" /> Available 24/7
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Response
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
