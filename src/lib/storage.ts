import { supabase } from './supabase';

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

function safeExt(name: string): string {
  const parts = name.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : '';
  return ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
}

function makeObjectPath(userId: string, originalName: string, folder?: string) {
  const ext = safeExt(originalName);
  const rand = Math.random().toString(36).slice(2);
  const base = `${Date.now()}-${rand}${ext ? `.${ext}` : ''}`;
  const prefix = folder ? `${folder.replace(/^\//, '').replace(/\/$/, '')}/` : '';
  return `${prefix}${userId}/${base}`;
}

export async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
  folder: string = ''
): Promise<UploadResult> {
  try {
    const path = makeObjectPath(userId, file.name, folder);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) return { url: null, path: null, error };

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, path, error: null };
  } catch (e) {
    return { url: null, path: null, error: e as Error };
  }
}

export async function uploadMultipleFiles(
  bucket: string,
  files: File[],
  userId: string,
  folder: string = ''
): Promise<{ urls: string[]; paths: string[]; errors: Error[] }> {
  const urls: string[] = [];
  const paths: string[] = [];
  const errors: Error[] = [];

  for (const f of files) {
    const res = await uploadFile(bucket, f, userId, folder);
    if (res.url) urls.push(res.url);
    if (res.path) paths.push(res.path);
    if (res.error) errors.push(res.error);
  }

  return { urls, paths, errors };
}

export async function base64ToFile(base64: string, filename: string): Promise<File> {
  // base64 is expected like: data:image/png;base64,xxxx
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'application/octet-stream' });
}


