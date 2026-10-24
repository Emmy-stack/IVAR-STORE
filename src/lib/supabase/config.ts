function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (/(your-|replace|placeholder|\*+|<)/i.test(trimmed)) return true;
  try {
    const url = new URL(trimmed);
    if (/(placeholder|your-project)/i.test(url.hostname)) return true;
  } catch {
    // Non-URL string, regex above is sufficient
  }
  return false;
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  return isPlaceholder(url) ? '' : url;
}

export function getSupabaseAnonKey(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ];
  for (const c of candidates) {
    if (c && !isPlaceholder(c)) {
      return c.trim();
    }
  }
  return '';
}

export function getSupabaseServiceRoleKey(): string {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
  ];
  for (const c of candidates) {
    if (c && !isPlaceholder(c)) {
      return c.trim();
    }
  }
  return '';
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSupabaseAdminConfigured(): boolean {
  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) return false;
  return isSupabaseConfigured();
}

export function assertAdminPersistenceConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !isSupabaseAdminConfigured()) {
    throw new Error(
      'Admin persistence is unavailable in production. Configure Supabase URL, anon key (or publishable key), and server-only service role key (or secret key); local JSON/filesystem storage is only suitable for local development.'
    );
  }
}

export interface SupabaseHealth {
  isConfigured: boolean;
  isAdminConfigured: boolean;
  tablesExist: boolean;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const isConfigured = isSupabaseConfigured();
  const isAdminConfigured = isSupabaseAdminConfigured();

  if (!isConfigured || !isAdminConfigured) {
    return {
      isConfigured,
      isAdminConfigured,
      tablesExist: false,
      error: 'Supabase credentials missing or invalid in environment variables.',
    };
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();
    const { error } = await supabase.from('accounts').select('id').limit(1);

    if (error) {
      return {
        isConfigured: true,
        isAdminConfigured: true,
        tablesExist: false,
        error: error.message,
      };
    }

    return {
      isConfigured: true,
      isAdminConfigured: true,
      tablesExist: true,
    };
  } catch (err: unknown) {
    return {
      isConfigured: true,
      isAdminConfigured: true,
      tablesExist: false,
      error: err instanceof Error ? err.message : 'Failed to query Supabase database.',
    };
  }
}

