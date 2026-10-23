import { cookies } from 'next/headers';
import { ADMIN_EMAIL } from '@/lib/constants';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';

export interface AdminUser {
  email: string;
  id: string;
  isAdmin: boolean;
}

export async function getAdminSession(): Promise<AdminUser | null> {
  // 1. If Supabase is configured, check authenticated user via Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!error && user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return {
          email: user.email,
          id: user.id,
          isAdmin: true,
        };
      }
    } catch (err) {
      console.error('Supabase auth session check failed:', err);
    }
  }

  // 2. Local fallback secure cookie check
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ivar_admin_session')?.value;

  if (sessionToken) {
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
      if (decoded.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && decoded.expiresAt > Date.now()) {
        return {
          email: decoded.email,
          id: decoded.id || 'admin-local',
          isAdmin: true,
        };
      }
    } catch {
      // Invalid token
    }
  }

  return null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    throw new Error('Unauthorized: Restricted to administrator (socialmeda03@gmail.com)');
  }
  return session;
}
