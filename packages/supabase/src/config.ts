import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
}

/**
 * Helper to create a Supabase client from environment variables.
 * Expects SUPABASE_URL and SUPABASE_KEY to be set.
 */
export function createSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error('Environment variables SUPABASE_URL and SUPABASE_KEY must be set.');
  }
  return createClient(url, key);
}
