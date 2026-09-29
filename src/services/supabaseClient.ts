import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'itam_supabase_url';
const STORAGE_KEY_KEY = 'itam_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || envUrl;
  const storedKey = localStorage.getItem(STORAGE_KEY_KEY) || envKey;

  return {
    url: storedUrl,
    anonKey: storedKey,
    isConfigured: Boolean(storedUrl && storedKey),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  try {
    if (!clientInstance) {
      clientInstance = createClient(url, anonKey);
    }
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; schemaReady?: boolean }> {
  try {
    const tempClient = createClient(url, anonKey);
    const { error } = await tempClient
      .from('asset_types')
      .select('count', { count: 'exact', head: true });

    if (error) {
      // Jika pesan berkaitan dengan tabel belum ada (PostgreSQL error 42P01 / relation does not exist)
      const errStr = (error.message || '').toLowerCase();
      if (error.code === '42P01' || errStr.includes('does not exist') || errStr.includes('relation')) {
        return {
          success: true,
          schemaReady: false,
          message:
            'Koneksi API Supabase BERHASIL! Namun tabel database belum dibuat. Silakan jalankan script supabase_schema.sql di SQL Editor Supabase Anda.',
        };
      }
      return { success: false, message: `Koneksi gagal (${error.code || 'API Error'}): ${error.message}` };
    }
    return {
      success: true,
      schemaReady: true,
      message: 'Koneksi ke database Supabase berhasil & seluruh skema tabel siap digunakan!',
    };
  } catch (err: any) {
    return { success: false, message: `Kesalahan koneksi: ${err.message || err}` };
  }
}
