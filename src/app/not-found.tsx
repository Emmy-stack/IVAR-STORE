import Link from 'next/link';
import { Flame, Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080D1A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-[#2563FF]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-8 sm:p-10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#080D1A] border border-[#1E2C4A] flex items-center justify-center mx-auto mb-6 text-[#00A3FF]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#00A3FF] bg-[#00A3FF]/10 px-3 py-1 rounded-full border border-[#00A3FF]/20 mb-4 inline-block">
          Zone Closed • 404
        </span>

        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Page Not Found
        </h1>

        <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
          The Free Fire account or page you are looking for does not exist, has been purchased, or has been removed from IVAR STORE.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/25 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>
          <Link
            href="/#accounts-section"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-[#080D1A] hover:bg-[#16233F] border border-[#1E2C4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Accounts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
