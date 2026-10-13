import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase environment variables are missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,

      // Family Connect uses its own auth storage.
      // This prevents localhost from reusing an eMAR session.
      storageKey: 'uaq-family-connect-auth',
    },
  }
)