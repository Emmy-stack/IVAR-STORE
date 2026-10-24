import fs from 'fs/promises';
import path from 'path';
import { Account, AccountFilterOptions, AccountImage, AccountStatus, DashboardStats } from '@/types';
import { assertAdminPersistenceConfigured, isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const LOCAL_DB_PATH = path.join(process.cwd(), 'src/lib/data/local-db.json');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// --- Helper Functions for Local DB operations ---
interface LocalDatabase {
  accounts: Account[];
  settings: Record<string, unknown>;
}

async function readLocalDb(): Promise<LocalDatabase> {
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db:', err);
    return { accounts: [], settings: {} };
  }
}

async function writeLocalDb(data: LocalDatabase): Promise<void> {
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
  assertAdminPersistenceConfigured();
  let highestNum = 0;

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('accounts').select('product_id');
    if (error) throw new Error(`Could not generate product ID: ${error.message}`);
    data?.forEach(item => {
      const match = item.product_id.match(/IVAR-FF-(\d+)/i);
      if (match) highestNum = Math.max(highestNum, parseInt(match[1], 10));
    });
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
      if (error) throw new Error(`Could not load published accounts: ${error.message}`);
      if (data) {
        let results = data as Account[];
        results.forEach(account => {
          account.images?.sort((a, b) => a.sort_order - b.sort_order);
        });
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
      console.error('Supabase published account query failed:', err);
      throw err;
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
  const cleanSlug = slug.trim();
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const isUuid = UUID_REGEX.test(cleanSlug);
      let query = supabase
        .from('accounts')
        .select(`
          *,
          images:account_images(*)
        `);

      if (isUuid) {
        query = query.or(`slug.eq."${cleanSlug}",product_id.eq."${cleanSlug}",id.eq."${cleanSlug}"`);
      } else {
        query = query.or(`slug.eq."${cleanSlug}",product_id.eq."${cleanSlug}"`);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw new Error(`Could not load account: ${error.message}`);
      if (data) {
        if (data.images && Array.isArray(data.images)) {
          data.images.sort((a: AccountImage, b: AccountImage) => a.sort_order - b.sort_order);
        }
        return data as Account;
      }
      return null;
    } catch (err) {
      console.error('Supabase getAccountBySlug failed:', err);
      throw err;
    }
  }

  const { accounts } = await readLocalDb();
  const lower = cleanSlug.toLowerCase();
  const found = accounts.find(
    a => a.slug.toLowerCase() === lower || a.product_id.toLowerCase() === lower || a.id.toLowerCase() === lower
  );
  return found || null;
}

export async function getAccountById(id: string): Promise<Account | null> {
  const cleanId = id.trim();
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const isUuid = UUID_REGEX.test(cleanId);
      let query = supabase
        .from('accounts')
        .select(`
          *,
          images:account_images(*)
        `);

      if (isUuid) {
        query = query.or(`id.eq."${cleanId}",product_id.eq."${cleanId}",slug.eq."${cleanId}"`);
      } else {
        query = query.or(`product_id.eq."${cleanId}",slug.eq."${cleanId}"`);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw new Error(`Could not load account: ${error.message}`);
      if (data) {
        if (data.images && Array.isArray(data.images)) {
          data.images.sort((a: AccountImage, b: AccountImage) => a.sort_order - b.sort_order);
        }
        return data as Account;
      }
      return null;
    } catch (err) {
      console.error('Supabase getAccountById failed:', err);
      throw err;
    }
  }

  const { accounts } = await readLocalDb();
  const lower = cleanId.toLowerCase();
  return accounts.find(a => a.id.toLowerCase() === lower || a.product_id.toLowerCase() === lower || a.slug.toLowerCase() === lower) || null;
}

export async function getAccountByIdAdmin(id: string): Promise<Account | null> {
  assertAdminPersistenceConfigured();
  const cleanId = id.trim();
  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const isUuid = UUID_REGEX.test(cleanId);
    let query = supabase
      .from('accounts')
      .select('*, images:account_images(*)');

    if (isUuid) {
      query = query.or(`id.eq."${cleanId}",product_id.eq."${cleanId}",slug.eq."${cleanId}"`);
    } else {
      query = query.or(`product_id.eq."${cleanId}",slug.eq."${cleanId}"`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw new Error(`Could not load account: ${error.message}`);
    if (data?.images) {
      data.images.sort((a: AccountImage, b: AccountImage) => a.sort_order - b.sort_order);
    }
    return data as Account | null;
  }

  const { accounts } = await readLocalDb();
  const lower = cleanId.toLowerCase();
  return accounts.find(a => a.id.toLowerCase() === lower || a.product_id.toLowerCase() === lower || a.slug.toLowerCase() === lower) || null;
}

// --- Admin Operations ---
export async function getAllAccountsAdmin(): Promise<Account[]> {
  assertAdminPersistenceConfigured();
  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('accounts')
      .select('*, images:account_images(*)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Could not load admin accounts: ${error.message}`);
    data?.forEach((account: Account) => {
      account.images?.sort((a: AccountImage, b: AccountImage) => a.sort_order - b.sort_order);
    });
    return data as Account[];
  }

  const { accounts } = await readLocalDb();
  return [...accounts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createAccount(
  accountData: Partial<Account>,
  images: { storage_path: string; is_primary: boolean }[] = []
): Promise<Account> {
  assertAdminPersistenceConfigured();
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

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
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

    if (error) throw new Error(`Could not create account: ${error.message}`);

    if (images.length > 0) {
      const imageInserts = images.map((img, idx) => ({
        account_id: data.id,
        storage_path: img.storage_path,
        sort_order: idx,
        is_primary: img.is_primary,
      }));
      const { error: imageError } = await supabase.from('account_images').insert(imageInserts);
      if (imageError) {
        const { error: rollbackError } = await supabase.from('accounts').delete().eq('id', data.id);
        if (rollbackError) console.error('Failed to roll back account after image insert failure:', rollbackError);
        throw new Error(`Account was not created because its images could not be saved: ${imageError.message}`);
      }
    }

    return {
      ...data,
      images: images.map((img, idx) => ({ ...img, account_id: data.id, sort_order: idx })),
    } as Account;
  }

  // Local DB write
  const db = await readLocalDb();
  const existingIdx = db.accounts.findIndex(a => a.product_id.toLowerCase() === newAccount.product_id.toLowerCase());
  if (existingIdx >= 0) {
    throw new Error(`Product ID ${newAccount.product_id} is already in use.`);
  }
  db.accounts.unshift(newAccount);
  await writeLocalDb(db);
  return newAccount;
}

export async function updateAccount(
  id: string,
  updates: Partial<Account>,
  images?: { storage_path: string; is_primary: boolean }[]
): Promise<Account> {
  assertAdminPersistenceConfigured();
  const now = new Date().toISOString();
  const resolvedImages = images !== undefined
    ? images
    : (updates.images as { storage_path: string; is_primary: boolean }[] | undefined);

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const existing = await getAccountByIdAdmin(id);
    if (!existing) throw new Error(`Account with ID ${id} not found`);
    const targetId = existing.id;

    // Check product_id uniqueness if updating product_id
    if (updates.product_id && updates.product_id !== existing.product_id) {
      const { data: duplicate } = await supabase
        .from('accounts')
        .select('id')
        .eq('product_id', updates.product_id)
        .neq('id', targetId)
        .maybeSingle();
      if (duplicate) {
        throw new Error(`Product ID ${updates.product_id} is already in use.`);
      }
    }

    const payload: Partial<Account> & { updated_at: string } = { ...updates, updated_at: now };
    delete payload.images;
    delete payload.id;
    if (updates.title || updates.product_id) {
      payload.slug = generateSlug(
        updates.title || existing.title,
        updates.product_id || existing.product_id
      );
    }

    const { data, error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('id', targetId)
      .select()
      .maybeSingle();

    if (error) throw new Error(`Could not update account: ${error.message}`);
    if (!data) throw new Error(`Account with ID ${id} not found`);

    if (resolvedImages) {
      const { error: deleteImagesError } = await supabase
        .from('account_images')
        .delete()
        .eq('account_id', targetId);
      if (deleteImagesError) {
        throw new Error(`Account was updated, but its image gallery could not be replaced: ${deleteImagesError.message}`);
      }
      if (resolvedImages.length > 0) {
        const imageInserts = resolvedImages.map((img, idx) => ({
          account_id: targetId,
          storage_path: img.storage_path,
          sort_order: idx,
          is_primary: img.is_primary,
        }));
        const { error: insertImagesError } = await supabase.from('account_images').insert(imageInserts);
        if (insertImagesError) {
          if (existing?.images?.length) {
            const restoreImages = existing.images.map((image, idx) => ({
              account_id: targetId,
              storage_path: image.storage_path,
              sort_order: idx,
              is_primary: image.is_primary,
            }));
            const { error: restoreError } = await supabase.from('account_images').insert(restoreImages);
            if (restoreError) console.error('Failed to restore account gallery:', restoreError);
          }
          throw new Error(`Account was updated, but its image gallery could not be saved: ${insertImagesError.message}`);
        }
      }

      const currentPaths = new Set(resolvedImages.map(image => image.storage_path));
      const removedPaths = (existing?.images || [])
        .map(image => image.storage_path)
        .filter(storagePath => !currentPaths.has(storagePath));
      if (removedPaths.length) {
        const { removeStoredAccountImages } = await import('@/lib/services/storage-service');
        const failedPaths = await removeStoredAccountImages(removedPaths);
        if (failedPaths.length) {
          console.error(`Account gallery saved, but ${failedPaths.length} unused file(s) could not be removed.`);
        }
      }
    }

    return {
      ...data,
      images: resolvedImages
        ? resolvedImages.map((img, idx) => ({
            id: `img-${Date.now()}-${idx}`,
            account_id: targetId,
            storage_path: img.storage_path,
            sort_order: idx,
            is_primary: img.is_primary,
            created_at: now,
          }))
        : existing.images,
    } as Account;
  }

  const db = await readLocalDb();
  const lowerId = id.trim().toLowerCase();
  const index = db.accounts.findIndex(
    a => a.id.toLowerCase() === lowerId || a.product_id.toLowerCase() === lowerId || a.slug.toLowerCase() === lowerId
  );
  if (index === -1) {
    throw new Error(`Account with ID ${id} not found`);
  }

  const current = db.accounts[index];
  const targetId = current.id;
  if (
    updates.product_id &&
    updates.product_id !== current.product_id &&
    db.accounts.some(account => account.id !== targetId && account.product_id.toLowerCase() === updates.product_id!.toLowerCase())
  ) {
    throw new Error(`Product ID ${updates.product_id} is already in use.`);
  }

  const updatedAccount: Account = {
    ...current,
    ...updates,
    ...(updates.title || updates.product_id
      ? { slug: generateSlug(updates.title || current.title, updates.product_id || current.product_id) }
      : {}),
    updated_at: now,
    images: resolvedImages
      ? resolvedImages.map((img, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          account_id: targetId,
          storage_path: img.storage_path,
          sort_order: idx,
          is_primary: img.is_primary,
          created_at: now,
        }))
      : current.images,
  };

  db.accounts[index] = updatedAccount;
  await writeLocalDb(db);
  if (resolvedImages) {
    const currentPaths = new Set(resolvedImages.map(image => image.storage_path));
    const removedPaths = (current.images || [])
      .map(image => image.storage_path)
      .filter(storagePath => !currentPaths.has(storagePath));
    if (removedPaths.length) {
      const { removeStoredAccountImages } = await import('@/lib/services/storage-service');
      const failedPaths = await removeStoredAccountImages(removedPaths);
      if (failedPaths.length) {
        console.error(`Account gallery saved, but ${failedPaths.length} unused local file(s) could not be removed.`);
      }
    }
  }
  return updatedAccount;
}

export async function updateAccountStatus(id: string, status: AccountStatus): Promise<void> {
  await updateAccount(id, { status });
}

export async function deleteAccount(id: string): Promise<void> {
  assertAdminPersistenceConfigured();
  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const existing = await getAccountByIdAdmin(id);
    if (!existing) throw new Error(`Account with ID ${id} not found`);
    const targetId = existing.id;

    const { data: lookupData, error: lookupError } = await supabase
      .from('account_images')
      .select('storage_path')
      .eq('account_id', targetId);
    if (lookupError) throw new Error(`Could not load account images before deletion: ${lookupError.message}`);

    const { data: deleted, error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', targetId)
      .select('id');
    if (error) throw new Error(`Could not delete account: ${error.message}`);
    if (!deleted?.length) throw new Error(`Account with ID ${id} not found`);

    const storagePaths = (lookupData || [])
      .map(image => image.storage_path)
      .filter((storagePath): storagePath is string => typeof storagePath === 'string');
    if (storagePaths.length) {
      const { removeStoredAccountImages } = await import('@/lib/services/storage-service');
      const failedPaths = await removeStoredAccountImages(storagePaths);
      if (failedPaths.length) {
        console.error(`Account deleted, but ${failedPaths.length} image file(s) could not be removed.`);
      }
    }
    return;
  }

  const db = await readLocalDb();
  const lowerId = id.trim().toLowerCase();
  const index = db.accounts.findIndex(
    item => item.id.toLowerCase() === lowerId || item.product_id.toLowerCase() === lowerId || item.slug.toLowerCase() === lowerId
  );
  if (index === -1) throw new Error(`Account with ID ${id} not found`);
  const account = db.accounts[index];
  db.accounts.splice(index, 1);
  await writeLocalDb(db);

  const imagePaths = (account.images || []).map(image => image.storage_path);
  if (imagePaths.length) {
    const { removeStoredAccountImages } = await import('@/lib/services/storage-service');
    const failedPaths = await removeStoredAccountImages(imagePaths);
    if (failedPaths.length) {
      console.error(`Account deleted, but ${failedPaths.length} local image file(s) could not be removed.`);
    }
  }
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
