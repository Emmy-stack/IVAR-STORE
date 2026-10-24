import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { deleteAccount, getAccountByIdAdmin, updateAccount } from '@/lib/services/account-service';

function getErrorStatus(err: unknown): number {
  if (typeof err === 'object' && err && 'status' in err && typeof err.status === 'number') {
    return err.status;
  }
  const msg = err instanceof Error ? err.message : '';
  if (msg.includes('Forbidden') || msg.includes('Access denied')) return 403;
  if (msg.includes('Authentication required') || msg.includes('Clerk configuration missing')) return 401;
  if (msg.includes('not found')) return 404;
  return 500;
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function isImageList(value: unknown): value is { storage_path: string; is_primary: boolean }[] {
  return Array.isArray(value) && value.every(image =>
    typeof image?.storage_path === 'string' &&
    image.storage_path.length > 0 &&
    image.storage_path.length <= 2048 &&
    !image.storage_path.startsWith('blob:') &&
    !image.storage_path.startsWith('data:') &&
    typeof image.is_primary === 'boolean'
  );
}

function hasValidPrimaryImage(images: { is_primary: boolean }[]): boolean {
  return images.length > 0 && images.filter(image => image.is_primary).length === 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickAccountUpdates(input: Record<string, unknown>): Record<string, unknown> {
  const allowedFields = [
    'product_id', 'title', 'description', 'price', 'level', 'rank',
    'skin_count', 'bundle_count', 'rare_skins', 'rare_bundles',
    'emotes', 'weapons', 'tags', 'status', 'published', 'featured',
  ];
  return Object.fromEntries(
    allowedFields.filter(field => field in input).map(field => [field, input[field]])
  );
}

function validateAccountUpdates(account: Record<string, unknown>): string | null {
  if ('title' in account && (typeof account.title !== 'string' || !account.title.trim())) {
    return 'Title is required.';
  }
  if ('product_id' in account && (typeof account.product_id !== 'string' || !account.product_id.trim())) {
    return 'Product ID is required.';
  }
  if ('price' in account && (typeof account.price !== 'number' || !Number.isFinite(account.price) || account.price <= 0)) {
    return 'Price must be a positive number.';
  }
  if ('level' in account && (typeof account.level !== 'number' || !Number.isInteger(account.level) || account.level < 1 || account.level > 100)) {
    return 'Level must be an integer between 1 and 100.';
  }
  if ('status' in account && !['available', 'reserved', 'sold'].includes(String(account.status))) {
    return 'Status must be available, reserved, or sold.';
  }
  for (const field of ['rare_skins', 'rare_bundles', 'emotes', 'weapons', 'tags']) {
    if (field in account && (!Array.isArray(account[field]) || !account[field].every(item => typeof item === 'string'))) {
      return `${field} must be a list of text values.`;
    }
  }
  for (const field of ['published', 'featured']) {
    if (field in account && typeof account[field] !== 'boolean') {
      return `${field} must be a boolean.`;
    }
  }
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const account = await getAccountByIdAdmin(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Could not load account') },
      { status: getErrorStatus(err) }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body: unknown = await request.json();

    if (!isRecord(body) || !isRecord(body.account)) {
      return NextResponse.json({ error: 'A valid account object is required.' }, { status: 400 });
    }

    const account = pickAccountUpdates(body.account);
    const validationError = validateAccountUpdates(account);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    if ('images' in body) {
      if (!isImageList(body.images) || !hasValidPrimaryImage(body.images)) {
        return NextResponse.json(
          { error: 'Provide a valid image list with exactly one primary image.' },
          { status: 400 }
        );
      }
    }

    const updated = await updateAccount(
      id,
      account,
      'images' in body ? body.images as { storage_path: string; is_primary: boolean }[] : undefined
    );

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/accounts');
      revalidatePath('/admin');
      revalidatePath('/admin/accounts');
      if (updated.slug) {
        revalidatePath(`/accounts/${updated.slug}`);
      }
    } catch (revalErr) {
      console.warn('Revalidation warning on update:', revalErr);
    }

    return NextResponse.json({ success: true, account: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to update account') },
      { status: getErrorStatus(err) }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await deleteAccount(id);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/accounts');
      revalidatePath('/admin');
      revalidatePath('/admin/accounts');
    } catch (revalErr) {
      console.warn('Revalidation warning on delete:', revalErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to delete account') },
      { status: getErrorStatus(err) }
    );
  }
}
