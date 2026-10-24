import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteAccount, getAccountById, updateAccount } from '@/lib/services/account-service';

function getAuthErrorStatus(err: any): number {
  const msg = err?.message || '';
  if (msg.includes('Forbidden')) return 403;
  if (msg.includes('Authentication required') || msg.includes('Clerk configuration missing')) return 401;
  return 401;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (err: any) {
    const status = getAuthErrorStatus(err);
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status }
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
    const body = await request.json();

    const { account, images } = body;

    const updated = await updateAccount(id, account, images);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    const status = getAuthErrorStatus(err);
    return NextResponse.json(
      { error: err.message || 'Failed to update account' },
      { status: err.message?.includes('Forbidden') || err.message?.includes('Authentication') ? status : 500 }
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
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const status = getAuthErrorStatus(err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete account' },
      { status: err.message?.includes('Forbidden') || err.message?.includes('Authentication') ? status : 500 }
    );
  }
}
