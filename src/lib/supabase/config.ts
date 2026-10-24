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

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (isPlaceholder(url) || isPlaceholder(anonKey)) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSupabaseAdminConfigured(): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || isPlaceholder(serviceKey)) return false;
  return isSupabaseConfigured();
}

export function assertAdminPersistenceConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !isSupabaseAdminConfigured()) {
    throw new Error(
      'Admin persistence is unavailable in production. Configure Supabase URL, anon key, and server-only service role key; local JSON/filesystem storage is only suitable for local development.'
    );
  }
}

