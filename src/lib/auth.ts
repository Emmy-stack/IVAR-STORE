import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAIL, isClerkConfigured } from '@/lib/clerk-config';

export interface AdminUser {
  email: string;
  id: string;
  isAdmin: boolean;
}

export type AuthCheckResult =
  | { status: 'authorized'; user: AdminUser }
  | { status: 'unauthenticated'; reason: string }
  | { status: 'unauthorized'; email?: string; reason: string }
  | { status: 'unconfigured'; reason: string };

/**
 * Server-side trusted authentication and authorization check.
 * Strictly verifies that the authenticated Clerk user possesses
 * the exact authorized admin email (socialmeda03@gmail.com) AND
 * that the email address is verified by Clerk.
 */
export async function checkAdminAuth(): Promise<AuthCheckResult> {
  if (!isClerkConfigured()) {
    return {
      status: 'unconfigured',
      reason: 'Clerk environment variables are not configured or still have placeholder values.',
    };
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        status: 'unauthenticated',
        reason: 'No authenticated user session found.',
      };
    }

    const user = await currentUser();

    if (!user) {
      return {
        status: 'unauthenticated',
        reason: 'Authenticated user details could not be retrieved from Clerk server.',
      };
    }

    const targetEmail = ADMIN_EMAIL.toLowerCase();

    // Check all verified emails associated with this Clerk account
    const matchedVerifiedEmail = user.emailAddresses.find((emailObj) => {
      const emailMatches = emailObj.emailAddress.toLowerCase() === targetEmail;
      const isVerified = emailObj.verification?.status === 'verified';
      return emailMatches && isVerified;
    });

    if (matchedVerifiedEmail) {
      return {
        status: 'authorized',
        user: {
          email: matchedVerifiedEmail.emailAddress,
          id: user.id,
          isAdmin: true,
        },
      };
    }

    // User is logged in, but not with the verified authorized admin email
    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress;

    return {
      status: 'unauthorized',
      email: primaryEmail,
      reason: `Account '${primaryEmail || 'unknown'}' is not authorized. Access is strictly restricted to verified ${ADMIN_EMAIL}.`,
    };
  } catch (error) {
    console.error('Clerk server-side auth verification error:', error);
    return {
      status: 'unauthenticated',
      reason: 'Failed to verify Clerk credentials with authentication server.',
    };
  }
}

/**
 * Retrieves the current authorized admin session or null.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const result = await checkAdminAuth();
  if (result.status === 'authorized') {
    return result.user;
  }
  return null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * Enforces admin authorization inside Server Components, Route Handlers, and Server Actions.
 * Throws an error with a status code:
 * - 401 if unauthenticated or Clerk unconfigured
 * - 403 if authenticated but not the authorized admin email
 */
export async function requireAdmin(): Promise<AdminUser> {
  const result = await checkAdminAuth();

  if (result.status === 'unconfigured') {
    throw new AuthError(
      'Clerk configuration missing: Please set active NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local',
      401
    );
  }

  if (result.status === 'unauthenticated') {
    throw new AuthError('Authentication required: Please sign in at /admin/login', 401);
  }

  if (result.status === 'unauthorized') {
    throw new AuthError(
      `Forbidden: Access denied for ${result.email || 'signed-in account'}. Access is strictly restricted to ${ADMIN_EMAIL}`,
      403
    );
  }

  return result.user;
}

/**
 * Asserts admin authorization for Page Server Components.
 * Redirects unauthenticated users to /admin/login.
 * Redirects unauthorized (wrong email or unverified) users to /admin/unauthorized.
 */
export async function assertAdminOrRedirect(): Promise<AdminUser> {
  const result = await checkAdminAuth();

  if (result.status === 'unauthorized') {
    redirect('/admin/unauthorized');
  }

  if (result.status !== 'authorized') {
    redirect('/admin/login');
  }

  return result.user;
}
