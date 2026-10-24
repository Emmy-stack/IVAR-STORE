import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Flame, Lock, Shield, AlertTriangle, Key, ExternalLink } from 'lucide-react';
import { checkAdminAuth } from '@/lib/auth';
import { isClerkConfigured, ADMIN_EMAIL } from '@/lib/clerk-config';

export const metadata = {
  title: 'Admin Sign In — IVAR STORE',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const isConfigured = isClerkConfigured();

  // If already authenticated, redirect appropriately
  if (isConfigured) {
    const authStatus = await checkAdminAuth();
    if (authStatus.status === 'authorized') {
      redirect('/admin');
    } else if (authStatus.status === 'unauthorized') {
      redirect('/admin/unauthorized');
    }
  }

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute w-[600px] h-[600px] bg-[#2563FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 text-center mb-6 max-w-md w-full">
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
          <span>Restricted Admin Portal</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">Admin Sign In</h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Access is strictly restricted to verified <strong className="text-white">{ADMIN_EMAIL}</strong>
        </p>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-md w-full flex justify-center">
        {!isConfigured ? (
          // Placeholder Key Notification Card
          <div className="w-full rounded-2xl bg-[#111A2E] border border-amber-500/30 p-8 shadow-2xl space-y-5 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-white">Clerk Configuration Required</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Placeholder keys (<code className="text-amber-400 font-mono">pk_test_your_publishable_key</code>) are currently present in your <code className="text-white font-mono">.env.local</code> file.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A] space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Key className="w-4 h-4 shrink-0" />
                <span>Next steps to activate login:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                <li>Sign in to your <strong className="text-white">Clerk Dashboard</strong>.</li>
                <li>Copy your <strong className="text-[#00A3FF]">Publishable Key</strong> and <strong className="text-[#00A3FF]">Secret Key</strong> from API Keys.</li>
                <li>Replace the placeholder values in <strong className="text-white">.env.local</strong>:
                  <div className="mt-1.5 p-2 rounded bg-black/60 font-mono text-[10px] text-slate-300 overflow-x-auto">
                    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...<br />
                    CLERK_SECRET_KEY=sk_test_...
                  </div>
                </li>
                <li>Restart the development server to load the new credentials.</li>
              </ol>
            </div>

            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] transition-all flex items-center justify-center gap-2"
            >
              <span>Open Clerk Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          // Clerk Official Sign-In Component
          <div className="w-full flex justify-center">
            <SignIn
              routing="path"
              path="/admin/login"
              fallbackRedirectUrl="/admin"
              forceRedirectUrl="/admin"
              signUpUrl={undefined}
              initialValues={{
                emailAddress: ADMIN_EMAIL,
              }}
              appearance={{
                variables: {
                  colorPrimary: '#00A3FF',
                  colorBackground: '#111A2E',
                  borderRadius: '0.75rem',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-[#111A2E] border border-[#1E2C4A] shadow-2xl rounded-2xl p-6 sm:p-8',
                  headerTitle: 'text-white font-black text-xl',
                  headerSubtitle: 'text-slate-400 text-xs',
                  socialButtonsBlockButton: 'bg-[#080D1A] border-[#1E2C4A] text-white hover:bg-[#1E2C4A]',
                  formButtonPrimary:
                    'bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] text-white font-bold transition-all shadow-lg shadow-[#00A3FF]/20 text-xs py-3 rounded-xl',
                  formFieldInput: 'bg-[#080D1A] border-[#1E2C4A] text-white focus:border-[#00A3FF] rounded-xl text-xs py-2.5',
                  formFieldLabel: 'text-slate-300 text-xs font-semibold',
                  footerActionLink: 'text-[#00A3FF] hover:text-white font-semibold',
                  footer: 'hidden',
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Security badge footer */}
      <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span>Protected with Clerk Authentication & Verified Email Enforcement</span>
      </div>
    </div>
  );
}
