import { ADMIN_EMAIL } from './constants';

export { ADMIN_EMAIL };

/**
 * Syntactically valid dummy fallback publishable key formatted as:
 * pk_test_ + Base64("ivar-store.clerk.accounts.dev$")
 * Used strictly to provide React context during static build prerendering
 * when user has not yet substituted real keys into .env.local.
 */
export const DUMMY_FALLBACK_PUBLISHABLE_KEY =
  'pk_test_aXZhci1zdG9yZS5jbGVyay5hY2NvdW50cy5kZXYk';

/**
 * Checks whether Clerk authentication is properly configured with live keys.
 * Detects placeholder keys such as 'pk_test_your_publishable_key'.
 */
export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const secretKey = process.env.CLERK_SECRET_KEY || '';

  if (!publishableKey || !secretKey) {
    return false;
  }

  // Check for common template placeholders
  if (
    publishableKey.includes('your_publishable_key') ||
    secretKey.includes('your_secret_key') ||
    publishableKey === 'pk_test_placeholder' ||
    secretKey === 'sk_test_placeholder' ||
    publishableKey === DUMMY_FALLBACK_PUBLISHABLE_KEY
  ) {
    return false;
  }

  return true;
}

/**
 * Returns a valid publishable key: the live user key if configured,
 * or the syntactically valid placeholder key to avoid ClerkProvider crashing.
 */
export function getSafeClerkPublishableKey(): string {
  if (isClerkConfigured() && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  }
  return DUMMY_FALLBACK_PUBLISHABLE_KEY;
}
