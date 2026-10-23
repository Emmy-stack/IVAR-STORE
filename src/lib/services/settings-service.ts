import fs from 'fs/promises';
import path from 'path';
import { StoreSettings } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { DEFAULT_CONTACT, DEFAULT_HERO_SETTINGS } from '@/lib/constants';

const LOCAL_DB_PATH = path.join(process.cwd(), 'src/lib/data/local-db.json');

const DEFAULT_SETTINGS: StoreSettings = {
  id: 'default',
  hero_video_url: '',
  hero_poster_url: DEFAULT_HERO_SETTINGS.posterUrl,
  hero_title: DEFAULT_HERO_SETTINGS.title,
  hero_subtitle: DEFAULT_HERO_SETTINGS.subtitle,
  hero_video_enabled: true,
  whatsapp_number: DEFAULT_CONTACT.whatsappNumber,
  telegram_number: DEFAULT_CONTACT.telegramNumber,
  telegram_url: DEFAULT_CONTACT.telegramUrl,
  sell_account_message: DEFAULT_CONTACT.sellAccountMessage,
  updated_at: new Date().toISOString(),
};

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (!error && data) {
        return data as StoreSettings;
      }
    } catch {
      // Fallback
    }
  }

  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(
  updates: Partial<StoreSettings>
): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('store_settings')
        .upsert(updated)
        .select()
        .single();

      if (!error && data) {
        return data as StoreSettings;
      }
    } catch (err) {
      console.warn('Supabase settings update error, falling back to local file:', err);
    }
  }

  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    parsed.settings = updated;
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings to local file:', err);
  }

  return updated;
}
