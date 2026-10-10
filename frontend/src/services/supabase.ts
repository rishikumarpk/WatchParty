import { createClient, Session } from '@supabase/supabase-js';
import api from './api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export interface SyncResult {
  token: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    avatar_id: string;
  };
}

/**
 * Synchronize Supabase session with application backend and local storage
 */
export const syncWithBackend = async (
  session: Session,
  profile?: { display_name?: string; avatar_id?: string }
): Promise<SyncResult> => {
  const payload = {
    access_token: session.access_token,
    display_name: profile?.display_name || session.user?.user_metadata?.display_name,
    avatar_id: profile?.avatar_id || session.user?.user_metadata?.avatar_id,
  };

  const { data } = await api.post('/auth/supabase-sync', payload);

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
};
