'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Flame,
  LayoutDashboard,
  Layers,
  PlusCircle,
  Video,
  PhoneCall,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { ADMIN_EMAIL } from '@/lib/constants';

interface AdminSidebarProps {
  adminEmail?: string;
}

export default function AdminSidebar({ adminEmail = ADMIN_EMAIL }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Accounts', href: '/admin/accounts', icon: Layers },
    { label: 'Add New Account', href: '/admin/accounts/new', icon: PlusCircle },
    { label: 'Hero Video', href: '/admin/hero', icon: Video },
    { label: 'Contact Settings', href: '/admin/contact', icon: PhoneCall },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: '/admin/login' });
    } catch (err) {
      console.error('Clerk signOut error:', err);
      router.push('/admin/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-5 bg-[#080D1A] border-r border-[#1E2C4A]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#1E2C4A]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563FF] to-[#00A3FF] flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#00A3FF]" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-white">IVAR ADMIN</span>
              <span className="block text-[10px] font-mono text-[#00A3FF]">Command Center</span>
            </div>
          </Link>

          {/* Close for mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Badge */}
        <div className="px-3 py-2 rounded-xl bg-[#111A2E] border border-[#1E2C4A] mb-6 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="overflow-hidden">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Authorized Root
            </span>
            <span className="block text-xs font-mono text-white truncate max-w-[170px]" title={adminEmail}>
              {adminEmail}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                    ? 'bg-gradient-to-r from-[#2563FF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#111A2E]'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-[#1E2C4A] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#111A2E] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-[#00A3FF]" />
            <span>View Live Website</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#080D1A] border-b border-[#1E2C4A]">
        <Link href="/admin" className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#00A3FF]" />
          <span className="font-bold text-sm text-white">IVAR ADMIN</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-[#111A2E] border border-[#1E2C4A] text-slate-300"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer (Modal) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 h-full z-10 animate-in slide-in-from-left">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
