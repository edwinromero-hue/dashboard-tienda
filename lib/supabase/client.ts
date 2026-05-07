// Server-only Supabase client. Usa service_role para SELECT con bypass de RLS.
// IMPORTANTE: este módulo NO debe importarse desde Client Components.
// El browser consume nuestros Route Handlers en /api/...

import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  url &&
    serviceKey &&
    !url.includes('your-project') &&
    !serviceKey.includes('your-service'),
);

let _client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  _client = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
