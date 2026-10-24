import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  createSignedUpload,
  removeStoredAccountImages,
  uploadFile,
  validateUploadMetadata,
} from '@/lib/services/storage-service';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

function getAuthErrorStatus(err: unknown): number {
  if (typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number') {
    return err.status;
  }
  const msg = err instanceof Error ? err.message : '';
  if (msg.includes('Forbidden') || msg.includes('Access denied')) return 403;
  if (msg.includes('Authentication') || msg.includes('Clerk configuration')) return 401;
  return 401;
}

function isAuthError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number';
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (request.headers.get('content-type')?.includes('application/json')) {
      const body: unknown = await request.json();
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json({ error: 'Valid upload metadata is required.' }, { status: 400 });
      }

      const { bucket, contentType, size } = body as {
        bucket?: unknown;
        contentType?: unknown;
        size?: unknown;
      };
      if (
        (bucket !== 'account-images' && bucket !== 'hero-media') ||
        typeof contentType !== 'string' ||
        typeof size !== 'number' ||
        !Number.isFinite(size)
      ) {
        return NextResponse.json({ error: 'Upload metadata is invalid.' }, { status: 400 });
      }

      validateUploadMetadata(contentType, size, bucket);
      if (!isSupabaseAdminConfigured()) {
        return NextResponse.json({ strategy: 'server' });
      }

      const signedUpload = await createSignedUpload(contentType, size, bucket);
      return NextResponse.json({
        strategy: 'signed',
        bucket,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        ...signedUpload,
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'account-images';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (bucket !== 'account-images' && bucket !== 'hero-media') {
      return NextResponse.json({ error: 'Unsupported storage bucket.' }, { status: 400 });
    }

    const result = await uploadFile(file, bucket);
    return NextResponse.json({
      success: true,
      url: result.url,
      storagePath: result.storagePath,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'File upload failed' },
      { status: isAuthError(err) ? getAuthErrorStatus(err) : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== 'object' ||
      !('storagePaths' in body) ||
      !Array.isArray(body.storagePaths) ||
      !body.storagePaths.every(storagePath => typeof storagePath === 'string' && storagePath.length <= 2048)
    ) {
      return NextResponse.json({ error: 'A valid storage path list is required.' }, { status: 400 });
    }

    const failures = await removeStoredAccountImages(body.storagePaths);
    if (failures.length) {
      return NextResponse.json(
        { error: `Could not remove ${failures.length} uploaded image file(s).`, failedPaths: failures },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not clean up uploaded images.' },
      { status: isAuthError(err) ? getAuthErrorStatus(err) : 500 }
    );
  }
}
