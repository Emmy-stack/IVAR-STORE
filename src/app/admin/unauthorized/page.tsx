'use client';

import Link from 'next/link';
import { useClerk, useUser } from '@clerk/nextjs';
import { ShieldAlert, LogOut, ArrowLeft, Flame, AlertCircle } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function AdminUnauthorizedPage() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const currentEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || 'Current Account';

  const handleSignOutAndSwitch = async () => {
    await signOut({ redirectUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#2563FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 max-w-lg w-full rounded-2xl bg-[#111A2E] border border-rose-500/30 p-8 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563FF] to-[#00A3FF] flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#00A3FF]" />
              </div>
            </div>
            <span className="text-xl font-black text-white">
              IVAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563FF] to-[#00A3FF]">STORE</span>
            </span>
          </Link>

          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>403 Forbidden Access</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Access Denied</h1>
          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            Administrative access is strictly restricted to the verified store administrator.
          </p>
        </div>

        {/* Account Details Box */}
        <div className="mb-6 p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Signed in as:</span>
            <span className="font-mono text-white font-semibold">{currentEmail}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-[#1E2C4A]/60">
            <span>Authorized Email:</span>
            <span className="font-mono text-emerald-400 font-semibold">{ADMIN_EMAIL}</span>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            Your account does not match the authorized admin email or has not been verified. Please sign out and sign in with <strong>{ADMIN_EMAIL}</strong>.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSignOutAndSwitch}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Account</span>
          </button>

          <Link
            href="/"
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-300 bg-[#080D1A] hover:bg-[#152038] border border-[#1E2C4A] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
