'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClerk, useUser } from '@clerk/nextjs';
import { LayoutDashboard, Lock, LogOut } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';

export default function AdminAuthLink() {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const className = 'flex items-center gap-1.5 text-slate-400 hover:text-[#00A3FF] transition-colors font-medium';
  const isVerifiedAdmin = Boolean(
    isLoaded &&
      isSignedIn &&
      user?.emailAddresses.some(
        ({ emailAddress, verification }) =>
          emailAddress.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
          verification?.status === 'verified'
      )
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <Link href="/admin/login" className={className}>
        <Lock className="w-3.5 h-3.5" />
        <span>Admin Login</span>
      </Link>
    );
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError('');

    try {
      await signOut({ redirectUrl: '/admin/login' });
    } catch (error) {
      console.error('Clerk signOut error:', error);
      setSignOutError('Could not sign out. Please try again.');
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-4">
        {isVerifiedAdmin && (
          <Link href="/admin" className={className}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Visit Admin Dashboard</span>
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={className}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isSigningOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
      {signOutError && (
        <span role="alert" className="text-[11px] text-rose-400">
          {signOutError}
        </span>
      )}
    </div>
  );
}
