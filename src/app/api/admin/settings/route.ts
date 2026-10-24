import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/settings-service';

function getAuthErrorStatus(err: any): number {
  if (err?.status) return err.status;
  const msg = err?.message || '';
  if (msg.includes('Forbidden') || msg.includes('Access denied')) return 403;
  if (msg.includes('Authentication') || msg.includes('Clerk configuration')) return 401;
  return 401;
}

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    const status = getAuthErrorStatus(err);
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
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
  } catch (err: any) {
    const status = getAuthErrorStatus(err);
    const isAuthError = err.message?.includes('Forbidden') || err.message?.includes('Authentication') || err.message?.includes('Access denied') || err.status;
    return NextResponse.json(
      { error: err.message || 'Failed to update settings' },
      { status: isAuthError ? status : 500 }
    );
  }
}
