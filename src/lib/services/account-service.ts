import fs from 'fs/promises';
import path from 'path';
import { Account, AccountFilterOptions, AccountImage, AccountStatus, DashboardStats } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';

const LOCAL_DB_PATH = path.join(process.cwd(), 'src/lib/data/local-db.json');

// --- Helper Functions for Local DB operations ---
async function readLocalDb(): Promise<{ accounts: Account[]; settings: any }> {
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db:', err);
    return { accounts: [], settings: {} };
  }
}

async function writeLocalDb(data: { accounts: Account[]; settings: any }): Promise<void> {
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function generateSlug(title: string, productId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const idSuffix = productId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${base.substring(0, 50)}-${idSuffix}`;
}

export async function getNextProductId(): Promise<string> {
  let highestNum = 0;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from('accounts')
        .select('product_id');
      
      if (data) {
        data.forEach(item => {
          const match = item.product_id.match(/IVAR-FF-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > highestNum) highestNum = num;
          }
        });
      }
    } catch {
      // Fallback to local
    }
  } else {
    const { accounts } = await readLocalDb();
    accounts.forEach(acc => {
      const match = acc.product_id.match(/IVAR-FF-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNum) highestNum = num;
      }
    });
  }

  const nextNum = highestNum + 1;
  return `IVAR-FF-${String(nextNum).padStart(4, '0')}`;
}

// --- Public Account Queries ---
export async function getPublishedAccounts(
  filters: AccountFilterOptions = {}
): Promise<Account[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      let query = supabase
        .from('accounts')
        .select(`
          *,
          images:account_images(*)
        `)
        .eq('published', true);

      if (filters.rank && filters.rank !== 'all') {
        query = query.eq('rank', filters.rank);
      }
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.minLevel !== undefined && filters.minLevel > 0) {
        query = query.gte('level', filters.minLevel);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Sort
      if (filters.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (filters.sortBy === 'featured') {
        query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase query error:', error);
      } else if (data) {
        let results = data as Account[];
        // Text search in title, product_id, description, tags, skins
        if (filters.query && filters.query.trim()) {
          const q = filters.query.toLowerCase().trim();
          results = results.filter(acc => {
            return (
              acc.title.toLowerCase().includes(q) ||
              acc.product_id.toLowerCase().includes(q) ||
              (acc.description && acc.description.toLowerCase().includes(q)) ||
              (acc.rank && acc.rank.toLowerCase().includes(q)) ||
              (acc.tags && acc.tags.some(t => t.toLowerCase().includes(q))) ||
              (acc.rare_skins && acc.rare_skins.some(s => s.toLowerCase().includes(q))) ||
              (acc.rare_bundles && acc.rare_bundles.some(b => b.toLowerCase().includes(q))) ||
              (acc.emotes && acc.emotes.some(e => e.toLowerCase().includes(q))) ||
              (acc.weapons && acc.weapons.some(w => w.toLowerCase().includes(q)))
            );
          });
        }
        return results;
      }
    } catch (err) {
      console.warn('Falling back to local database for published accounts:', err);
    }
  }

  // Local database fallback
  const { accounts } = await readLocalDb();
  let results = accounts.filter(a => a.published);

  if (filters.rank && filters.rank !== 'all') {
    results = results.filter(a => a.rank.toLowerCase() === filters.rank?.toLowerCase());
  }
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    results = results.filter(a => a.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    results = results.filter(a => a.price <= filters.maxPrice!);
  }
  if (filters.minLevel !== undefined && filters.minLevel > 0) {
    results = results.filter(a => a.level >= filters.minLevel!);
  }
  if (filters.status && filters.status !== 'all') {
    results = results.filter(a => a.status === filters.status);
  }

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(acc => {
      return (
        acc.title.toLowerCase().includes(q) ||
        acc.product_id.toLowerCase().includes(q) ||
        (acc.description && acc.description.toLowerCase().includes(q)) ||
        (acc.rank && acc.rank.toLowerCase().includes(q)) ||
        (acc.tags && acc.tags.some(t => t.toLowerCase().includes(q))) ||
        (acc.rare_skins && acc.rare_skins.some(s => s.toLowerCase().includes(q))) ||
        (acc.rare_bundles && acc.rare_bundles.some(b => b.toLowerCase().includes(q))) ||
        (acc.emotes && acc.emotes.some(e => e.toLowerCase().includes(q))) ||
        (acc.weapons && acc.weapons.some(w => w.toLowerCase().includes(q)))
      );
    });
  }

  // Sorting
  if (filters.sortBy === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'featured') {
    results.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } else {
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return results;
}

export async function getAccountBySlug(slug: string): Promise<Account | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          images:account_images(*)
        `)
        .eq('slug', slug)
        .single();

      if (!error && data) {
        // Sort images by sort_order
        if (data.images && Array.isArray(data.images)) {
          data.images.sort((a: AccountImage, b: AccountImage) => a.sort_order - b.sort_order);
        }
        return data as Account;
      }
    } catch {
      // Fallback
    }
  }

  const { accounts } = await readLocalDb();
  const found = accounts.find(a => a.slug === slug || a.product_id.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function getAccountById(id: string): Promise<Account | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          images:account_images(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        if (data.images && Array.isArray(data.images)) {
          data.images.sort((a: AccountImage, b: AccountImage) => a.sort_order - b.sort_order);
        }
        return data as Account;
      }
    } catch {
      // Fallback
    }
  }

  const { accounts } = await readLocalDb();
  return accounts.find(a => a.id === id) || null;
}

// --- Admin Operations ---
export async function getAllAccountsAdmin(): Promise<Account[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          images:account_images(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Account[];
      }
    } catch (err) {
      console.warn('Admin fetch fallback:', err);
    }
  }

  const { accounts } = await readLocalDb();
  return [...accounts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createAccount(
  accountData: Partial<Account>,
  images: { storage_path: string; is_primary: boolean }[] = []
): Promise<Account> {
  const productId = accountData.product_id || (await getNextProductId());
  const title = accountData.title || 'Untitled Free Fire Account';
  const slug = accountData.slug || generateSlug(title, productId);
  const now = new Date().toISOString();

  const newAccount: Account = {
    id: accountData.id || `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    product_id: productId,
    slug,
    title,
    description: accountData.description || '',
    price: Number(accountData.price) || 0,
    level: Number(accountData.level) || 1,
    rank: accountData.rank || 'Grandmaster',
    skin_count: Number(accountData.skin_count) || 0,
    bundle_count: Number(accountData.bundle_count) || 0,
    rare_skins: accountData.rare_skins || [],
    rare_bundles: accountData.rare_bundles || [],
    emotes: accountData.emotes || [],
    weapons: accountData.weapons || [],
    tags: accountData.tags || [],
    status: accountData.status || 'available',
    published: accountData.published !== undefined ? accountData.published : true,
    featured: Boolean(accountData.featured),
    created_at: now,
    updated_at: now,
    images: images.map((img, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      account_id: accountData.id || '',
      storage_path: img.storage_path,
      sort_order: idx,
      is_primary: img.is_primary,
      created_at: now,
    })),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          product_id: newAccount.product_id,
          slug: newAccount.slug,
          title: newAccount.title,
          description: newAccount.description,
          price: newAccount.price,
          level: newAccount.level,
          rank: newAccount.rank,
          skin_count: newAccount.skin_count,
          bundle_count: newAccount.bundle_count,
          rare_skins: newAccount.rare_skins,
          rare_bundles: newAccount.rare_bundles,
          emotes: newAccount.emotes,
          weapons: newAccount.weapons,
          tags: newAccount.tags,
          status: newAccount.status,
          published: newAccount.published,
          featured: newAccount.featured,
        })
        .select()
        .single();

      if (error) throw error;

      if (data && images.length > 0) {
        const imageInserts = images.map((img, idx) => ({
          account_id: data.id,
          storage_path: img.storage_path,
          sort_order: idx,
          is_primary: img.is_primary,
        }));
        await supabase.from('account_images').insert(imageInserts);
      }

      return data as Account;
    } catch (err) {
      console.warn('Supabase createAccount error, writing to local db:', err);
    }
  }

  // Local DB write
  const db = await readLocalDb();
  // Ensure no duplicate product_id
  const existingIdx = db.accounts.findIndex(a => a.product_id === newAccount.product_id);
  if (existingIdx >= 0) {
    db.accounts[existingIdx] = newAccount;
  } else {
    db.accounts.unshift(newAccount);
  }
  await writeLocalDb(db);
  return newAccount;
}

export async function updateAccount(
  id: string,
  updates: Partial<Account>,
  images?: { storage_path: string; is_primary: boolean }[]
): Promise<Account> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const payload: any = { ...updates, updated_at: now };
      delete payload.images;
      delete payload.id;

      const { data, error } = await supabase
        .from('accounts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (images) {
        // Refresh images
        await supabase.from('account_images').delete().eq('account_id', id);
        if (images.length > 0) {
          const imageInserts = images.map((img, idx) => ({
            account_id: id,
            storage_path: img.storage_path,
            sort_order: idx,
            is_primary: img.is_primary,
          }));
          await supabase.from('account_images').insert(imageInserts);
        }
      }

      return data as Account;
    } catch (err) {
      console.warn('Supabase updateAccount error, updating local:', err);
    }
  }

  const db = await readLocalDb();
  const index = db.accounts.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error(`Account with ID ${id} not found`);
  }

  const current = db.accounts[index];
  const updatedAccount: Account = {
    ...current,
    ...updates,
    updated_at: now,
    images: images
      ? images.map((img, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          account_id: id,
          storage_path: img.storage_path,
          sort_order: idx,
          is_primary: img.is_primary,
          created_at: now,
        }))
      : current.images,
  };

  db.accounts[index] = updatedAccount;
  await writeLocalDb(db);
  return updatedAccount;
}

export async function updateAccountStatus(id: string, status: AccountStatus): Promise<void> {
  await updateAccount(id, { status });
}

export async function deleteAccount(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase delete error, deleting from local:', err);
    }
  }

  const db = await readLocalDb();
  db.accounts = db.accounts.filter(a => a.id !== id);
  await writeLocalDb(db);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const accounts = await getAllAccountsAdmin();

  const totalListings = accounts.length;
  const availableCount = accounts.filter(a => a.status === 'available').length;
  const reservedCount = accounts.filter(a => a.status === 'reserved').length;
  const soldCount = accounts.filter(a => a.status === 'sold').length;

  const recentAdded = [...accounts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentUpdated = [...accounts]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return {
    totalListings,
    availableCount,
    reservedCount,
    soldCount,
    recentAdded,
    recentUpdated,
  };
}
