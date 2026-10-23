'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Lock, Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(data.message || 'Authentication successful! Redirecting...');
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute w-[500px] h-[500px] bg-[#2563FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-8 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563FF] to-[#00A3FF] flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#00A3FF]" />
              </div>
            </div>
            <span className="text-xl font-black text-white">
              IVAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563FF] to-[#00A3FF]">STORE</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#00A3FF] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            <span>Authorized Management Portal</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">Admin Sign In</h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Access is strictly restricted to the registered administrator.
          </p>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Authorized Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="socialmeda03@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF] font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Only <strong className="text-slate-400">{ADMIN_EMAIL}</strong> is authorized.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-8 pt-6 border-t border-[#1E2C4A]/70 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured with Supabase RLS & Role Verification</span>
        </div>
      </div>
    </div>
  );
}
