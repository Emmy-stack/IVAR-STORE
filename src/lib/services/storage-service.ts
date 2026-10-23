import fs from 'fs/promises';
import path from 'path';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';

export interface UploadResult {
  url: string;
  storagePath: string;
}

export async function uploadFile(
  file: File,
  bucket: 'account-images' | 'hero-media'
): Promise<UploadResult> {
  // Validate file size
  const maxImageSize = 15 * 1024 * 1024; // 15MB
  const maxVideoSize = 100 * 1024 * 1024; // 100MB
  const isVideo = file.type.startsWith('video/');

  if (isVideo && file.size > maxVideoSize) {
    throw new Error('Video file size exceeds maximum 100MB limit');
  }
  if (!isVideo && file.size > maxImageSize) {
    throw new Error('Image file size exceeds maximum 15MB limit');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  // If Supabase is configured, upload to Supabase Storage bucket
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        storagePath: data.path,
      };
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local filesystem storage:', err);
    }
  }

  // Local fallback: save to public/uploads/
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
