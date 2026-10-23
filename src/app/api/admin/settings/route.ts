import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/settings-service';

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: 401 }
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
    return NextResponse.json(
      { error: err.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
