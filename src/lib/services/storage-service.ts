import fs from 'fs/promises';
import path from 'path';
import { assertAdminPersistenceConfigured, isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { createAdminClient } from '@/lib/supabase/admin';

export interface UploadResult {
  url: string;
  storagePath: string;
}

interface UploadValidation {
  extension: string;
}

function validateUpload(
  contentType: string,
  size: number,
  bucket: 'account-images' | 'hero-media'
): UploadValidation {
  const imageExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const videoExtensions: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  const mimeExtensions = bucket === 'account-images'
    ? imageExtensions
    : { ...imageExtensions, ...videoExtensions };
  const extension = mimeExtensions[contentType];
  if (!extension) {
    throw new Error(
      bucket === 'account-images'
        ? 'Unsupported image format. Use JPEG, PNG, or WebP.'
        : 'Unsupported media format. Use JPEG, PNG, WebP, MP4, WebM, or MOV.'
    );
  }

  const isVideo = contentType.startsWith('video/');
  const maxSize = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
  if (size <= 0) throw new Error('The selected file is empty.');
  if (size > maxSize) {
    throw new Error(isVideo ? 'Video file size exceeds maximum 100MB limit.' : 'Image file size exceeds maximum 15MB limit.');
  }

  return { extension };
}

function createStorageFileName(extension: string): string {
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

export function validateUploadMetadata(
  contentType: string,
  size: number,
  bucket: 'account-images' | 'hero-media'
): void {
  validateUpload(contentType, size, bucket);
}

export async function createSignedUpload(
  contentType: string,
  size: number,
  bucket: 'account-images' | 'hero-media'
) {
  const { extension } = validateUpload(contentType, size, bucket);
  const path = createStorageFileName(extension);
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: false });

  if (error) {
    console.error('Could not create Supabase signed upload:', error);
    throw new Error(`Could not prepare storage upload: ${error.message}`);
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return {
    path: data.path,
    token: data.token,
    url: publicUrl.publicUrl,
  };
}

export async function uploadFile(
  file: File,
  bucket: 'account-images' | 'hero-media'
): Promise<UploadResult> {
  assertAdminPersistenceConfigured();
  const { extension } = validateUpload(file.type, file.size, bucket);
  const fileName = createStorageFileName(extension);
  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload failed:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      storagePath: publicUrlData.publicUrl,
    };
  }

  // Local storage supports development only; it is not persistent on serverless hosts.
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', bucket);
  await fs.mkdir(uploadsDir, { recursive: true });

  const destination = path.join(uploadsDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(destination, buffer);

  const localUrl = `/uploads/${bucket}/${fileName}`;
  return {
    url: localUrl,
    storagePath: localUrl,
  };
}

export async function removeStoredAccountImages(storagePaths: string[]): Promise<string[]> {
  if (!storagePaths.length) return [];
  const failedPaths: string[] = [];

  if (isSupabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const bucketPaths = new Map<string, string[]>();

    for (const storagePath of storagePaths) {
      if (!storagePath || storagePath.startsWith('/images/')) continue;

      try {
        const pathname = new URL(storagePath, 'http://localhost').pathname;
        const match = pathname.match(
          /\/storage\/v1\/object\/public\/(account-images|hero-media)\/(.+)$/
        );
        if (match) {
          const bucket = match[1];
          const objectPath = decodeURIComponent(match[2]);
          bucketPaths.set(bucket, [...(bucketPaths.get(bucket) || []), objectPath]);
        } else {
          // Check if direct file name in bucket
          const parts = storagePath.split('/');
          const filename = parts[parts.length - 1];
          if (filename && filename.includes('.')) {
            bucketPaths.set('account-images', [...(bucketPaths.get('account-images') || []), filename]);
          }
        }
      } catch {
        console.warn('Skipping unrecognized account image storage path.');
      }
    }

    for (const [bucket, paths] of bucketPaths) {
      if (!paths.length) continue;
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.error(`Failed to remove unused files from ${bucket}:`, error);
        failedPaths.push(...paths);
      }
    }
    return failedPaths;
  }

  for (const storagePath of storagePaths) {
    if (!storagePath || storagePath.startsWith('/images/')) continue;

    const match = storagePath.match(/^\/uploads\/(account-images|hero-media)\/([^/]+)$/);
    if (!match) continue;
    const bucket = match[1];
    const filename = match[2];
    try {
      await fs.unlink(path.join(process.cwd(), 'public', 'uploads', bucket, filename));
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        console.error('Failed to remove local account image:', error);
        failedPaths.push(storagePath);
      }
    }
  }
  return failedPaths;
}

