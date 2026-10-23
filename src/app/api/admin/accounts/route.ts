import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAccount, getAllAccountsAdmin, getNextProductId } from '@/lib/services/account-service';

export async function GET() {
  try {
    await requireAdmin();
    const accounts = await getAllAccountsAdmin();
    const nextProductId = await getNextProductId();
    return NextResponse.json({ accounts, nextProductId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { account, images } = body;

    if (!account.title || account.price === undefined) {
      return NextResponse.json(
        { error: 'Title and Price are required fields' },
        { status: 400 }
      );
    }

    if (Number(account.price) < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    const created = await createAccount(account, images || []);
    return NextResponse.json({ success: true, account: created });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
