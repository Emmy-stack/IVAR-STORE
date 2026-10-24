import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/settings-service';

function getAuthErrorStatus(err: unknown): number {
  if (typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number') {
    return (err as { status: number }).status;
  }
  const msg = err instanceof Error ? err.message : '';
  if (msg.includes('Forbidden') || msg.includes('Access denied')) return 403;
  if (msg.includes('Authentication') || msg.includes('Clerk configuration')) return 401;
  return 401;
}

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const status = getAuthErrorStatus(err);
    const message = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const updated = await updateStoreSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    const status = getAuthErrorStatus(err);
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    const isAuthError = message.includes('Forbidden') || message.includes('Authentication') || message.includes('Access denied') || (typeof err === 'object' && err !== null && 'status' in err);
    return NextResponse.json(
      { error: message },
      { status: isAuthError ? status : 500 }
    );
  }
}
