
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the required environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or anonymous key is missing. Make sure your environment variables are set correctly.'
  );
  // Provide fallback values for development to prevent crashes
  // These won't actually connect to any real Supabase instance
  const fallbackUrl = 'https://placeholder-project.supabase.co';
  const fallbackKey = 'placeholder-key';
  
  // Create a client with fallback values (will fail gracefully)
  export const supabase = createClient<Database>(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || fallbackKey
  );
} else {
  // Create a single supabase client for interacting with your database
  export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}
