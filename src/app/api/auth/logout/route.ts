import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createServerClient();
      await supabase.auth.signOut();
    }

    const cookieStore = await cookies();
    cookieStore.delete('ivar_admin_session');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
