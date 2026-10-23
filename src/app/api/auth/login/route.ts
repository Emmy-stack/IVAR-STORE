import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_EMAIL } from '@/lib/constants';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // STRICT CHECK: Only socialmeda03@gmail.com is authorized
    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: Access is restricted strictly to the administrator.' },
        { status: 403 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerClient();
      
      // Attempt sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        // If user doesn't exist yet, handle trusted initial admin registration
        if (error.message.includes('Invalid login credentials')) {
          // Attempt sign-up if this is the authorized admin email first time setup
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
          });

          if (signUpError) {
            return NextResponse.json({ error: error.message }, { status: 401 });
          }

          if (signUpData.user) {
            return NextResponse.json({
              success: true,
              message: 'Administrator account provisioned successfully. Check your email for confirmation if required, or sign in.',
              user: { email: signUpData.user.email },
            });
          }
        }
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { email: data.user.email },
      });
    }

    // Local development fallback: verify email matches and password length >= 6
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Issue secure session cookie
    const cookieStore = await cookies();
    const sessionPayload = {
      email: normalizedEmail,
      id: 'admin-local',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    cookieStore.set('ivar_admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: { email: normalizedEmail },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
