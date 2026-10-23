import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteAccount, getAccountById, updateAccount } from '@/lib/services/account-service';

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
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: 401 }
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
    return NextResponse.json(
      { error: err.message || 'Failed to update account' },
      { status: 500 }
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
    return NextResponse.json(
      { error: err.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
