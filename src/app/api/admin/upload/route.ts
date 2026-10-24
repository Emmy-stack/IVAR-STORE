import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadFile } from '@/lib/services/storage-service';

function getAuthErrorStatus(err: any): number {
  if (err?.status) return err.status;
  const msg = err?.message || '';
  if (msg.includes('Forbidden') || msg.includes('Access denied')) return 403;
  if (msg.includes('Authentication') || msg.includes('Clerk configuration')) return 401;
  return 401;
}

export async function POST(request: Request) {
  try {
    // Authorize admin
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as 'account-images' | 'hero-media') || 'account-images';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await uploadFile(file, bucket);
    return NextResponse.json({
      success: true,
      url: result.url,
      storagePath: result.storagePath,
    });
  } catch (err: any) {
    const status = getAuthErrorStatus(err);
    const isAuthError = err.message?.includes('Forbidden') || err.message?.includes('Authentication') || err.message?.includes('Access denied') || err.status;
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: isAuthError ? status : 500 }
    );
  }
}
