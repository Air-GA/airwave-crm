
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Declare the supabase client variable
let supabaseClient: ReturnType<typeof createClient<Database>>;

// Validate that the required environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or anonymous key is missing. Using fallback values for development. The app will work with mock data but won\'t connect to a real database.'
  );
  // Provide fallback values for development to prevent crashes
  const fallbackUrl = 'https://placeholder-project.supabase.co';
  const fallbackKey = 'placeholder-key';
  
  // Create a client with fallback values (will fail gracefully)
  supabaseClient = createClient<Database>(
    fallbackUrl,
    fallbackKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: (...args) => fetch(...args),
      },
    }
  );
} else {
  // Create a single supabase client for interacting with your database
  supabaseClient = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: (...args) => fetch(...args),
      },
    }
  );
}

// Add extended helper methods
const supabase = {
  ...supabaseClient,
  
  // Helper to convert customer data to DB format
  formatCustomerForDb: (customer: any) => {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      address: customer.address || null,
      service_address: customer.serviceAddress || null,
      bill_address: customer.billAddress || null,
      type: customer.type || 'residential',
      created_at: customer.createdAt || new Date().toISOString()
    };
  }
};

// Export the initialized client
export { supabase };
