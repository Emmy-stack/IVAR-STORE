import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createAccount, getAllAccountsAdmin, getNextProductId } from '@/lib/services/account-service';

function getErrorStatus(err: unknown): number {
  if (typeof err === 'object' && err && 'status' in err && typeof err.status === 'number') {
    return err.status;
  }
  const message = err instanceof Error ? err.message : '';
  if (message.includes('Forbidden') || message.includes('Access denied')) return 403;
  if (message.includes('Authentication required') || message.includes('Clerk configuration missing')) return 401;
  return 500;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export async function GET() {
  try {
    await requireAdmin();
    const accounts = await getAllAccountsAdmin();
    const nextProductId = await getNextProductId();
    return NextResponse.json({ accounts, nextProductId });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Could not load accounts') },
      { status: getErrorStatus(err) }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body: unknown = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid request body is required.' }, { status: 400 });
    }
    const { account, images } = body as {
      account?: unknown;
      images?: unknown;
    };

    if (!account || typeof account !== 'object' || Array.isArray(account)) {
      return NextResponse.json({ error: 'A valid account object is required.' }, { status: 400 });
    }
    const accountData = account as Record<string, unknown>;
    if (typeof accountData.title !== 'string' || !accountData.title.trim() ||
      typeof accountData.product_id !== 'string' || !accountData.product_id.trim()) {
      return NextResponse.json(
        { error: 'Title and Product ID are required fields.' },
        { status: 400 }
      );
    }

    if (typeof accountData.price !== 'number' || !Number.isFinite(accountData.price) || accountData.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0 || images.some(image =>
      !image ||
      typeof image !== 'object' ||
      typeof image.storage_path !== 'string' ||
      image.storage_path.length === 0 ||
      image.storage_path.length > 2048 ||
      image.storage_path.startsWith('blob:') ||
      image.storage_path.startsWith('data:') ||
      typeof image.is_primary !== 'boolean'
    ) || images.filter(image => image.is_primary).length !== 1) {
      return NextResponse.json(
        { error: 'Provide at least one valid uploaded image and choose exactly one primary image.' },
        { status: 400 }
      );
    }

    if (typeof accountData.level !== 'number' || !Number.isInteger(accountData.level) || accountData.level < 1 || accountData.level > 100) {
      return NextResponse.json({ error: 'Level must be an integer between 1 and 100.' }, { status: 400 });
    }
    if (!['available', 'reserved', 'sold'].includes(String(accountData.status))) {
      return NextResponse.json({ error: 'Status must be available, reserved, or sold.' }, { status: 400 });
    }
    const listFields = ['rare_skins', 'rare_bundles', 'emotes', 'weapons', 'tags'];
    if (listFields.some(field => !Array.isArray(accountData[field]) || !(accountData[field] as unknown[]).every(item => typeof item === 'string'))) {
      return NextResponse.json({ error: 'Rare items, emotes, weapons, and tags must be lists of text.' }, { status: 400 });
    }

    const allowedFields = [
      'product_id', 'title', 'description', 'price', 'level', 'rank',
      'skin_count', 'bundle_count', 'rare_skins', 'rare_bundles',
      'emotes', 'weapons', 'tags', 'status', 'published', 'featured',
    ];
    const cleanAccount = Object.fromEntries(
      allowedFields.filter(field => field in accountData).map(field => [field, accountData[field]])
    );
    const created = await createAccount(
      cleanAccount,
      images as { storage_path: string; is_primary: boolean }[]
    );

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/accounts');
      revalidatePath('/admin');
      revalidatePath('/admin/accounts');
      if (created.slug) {
        revalidatePath(`/accounts/${created.slug}`);
      }
    } catch (revalErr) {
      console.warn('Revalidation warning on create:', revalErr);
    }

    return NextResponse.json({ success: true, account: created });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to create account') },
      { status: getErrorStatus(err) }
    );
  }
}
