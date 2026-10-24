'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';

const ADMIN_LOGIN_INTENT_KEY = 'ivar-admin-login-intent';

export default function AdminSignInRedirect({
  authConfigured,
}: {
  authConfigured: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const isAdminLoginRoute =
      pathname === '/admin/login' || pathname.startsWith('/admin/login/');

    if (isAdminLoginRoute) {
      window.sessionStorage.setItem(ADMIN_LOGIN_INTENT_KEY, 'true');

      if (!authConfigured || !isLoaded || !isSignedIn) return;

      const isAuthorizedAdmin = user.emailAddresses.some(
        ({ emailAddress, verification }) =>
          emailAddress.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
          verification?.status === 'verified'
      );

      window.sessionStorage.removeItem(ADMIN_LOGIN_INTENT_KEY);
      router.replace(isAuthorizedAdmin ? '/admin' : '/admin/unauthorized');
      return;
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      window.sessionStorage.removeItem(ADMIN_LOGIN_INTENT_KEY);
      return;
    }

    if (!authConfigured || !isLoaded || !isSignedIn) return;

    const isAuthorizedAdmin = user.emailAddresses.some(
      ({ emailAddress, verification }) =>
        emailAddress.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        verification?.status === 'verified'
    );
    const startedAdminLogin =
      window.sessionStorage.getItem(ADMIN_LOGIN_INTENT_KEY) === 'true';

    if (startedAdminLogin && isAuthorizedAdmin) {
      window.sessionStorage.removeItem(ADMIN_LOGIN_INTENT_KEY);
      router.replace('/admin');
    } else if (!isAuthorizedAdmin) {
      window.sessionStorage.removeItem(ADMIN_LOGIN_INTENT_KEY);
    }
  }, [authConfigured, isLoaded, isSignedIn, pathname, router, user]);

  return null;
}
