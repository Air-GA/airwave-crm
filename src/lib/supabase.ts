
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { Customer } from '@/types';

// Use the real Supabase URL and key from the client file
const supabaseUrl = "https://anofwxgkmwhwshdqxfzb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub2Z3eGdrbXdod3NoZHF4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTk0NDIsImV4cCI6MjA1OTE5NTQ0Mn0.MjL9maVqFkUOYodFD86qsct8OnSE9Uog10KMVmxZd8Q";

// Create a single supabase client for interacting with your database
const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage,
    },
  }
);

// Add extended helper methods
const supabase = {
  client: supabaseClient,
  auth: supabaseClient.auth,
  realtime: supabaseClient.realtime,
  from: supabaseClient.from.bind(supabaseClient),
  functions: supabaseClient.functions,
  
  // Helper to convert customer data to DB format
  formatCustomerForDb: (customer: Customer) => {
    const serviceAddresses = customer.serviceAddresses?.map((addr) => ({
      address: addr.address,
      is_primary: addr.isPrimary || false,
      notes: addr.notes || '',
    })) || [];

    // If no service addresses but has a serviceAddress field, add it as primary
    if (serviceAddresses.length === 0 && customer.serviceAddress) {
      serviceAddresses.push({
        address: customer.serviceAddress,
        is_primary: true,
        notes: '',
      });
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      address: customer.address || null,
      service_addresses: serviceAddresses,
      bill_address: customer.billAddress || null,
      type: customer.type || 'residential', // Default to residential
      created_at: customer.createdAt || new Date().toISOString(),
      status: 'active' // Add status field with default 'active'
    };
  },
  
  // Helper to convert DB data to Customer type
  formatDbToCustomer: (dbCustomer: any): Customer => {
    return {
      id: dbCustomer.id,
      name: dbCustomer.name,
      email: dbCustomer.email || '',
      phone: dbCustomer.phone || '',
      address: dbCustomer.address || '',
      billAddress: dbCustomer.bill_address || dbCustomer.address || '',
      serviceAddress: dbCustomer.service_address || '',
      serviceAddresses: dbCustomer.service_addresses?.map((addr: any) => ({
        id: addr.id || `addr-${Math.random().toString(36).substring(2, 9)}`,
        address: addr.address,
        isPrimary: addr.is_primary || false,
        notes: addr.notes || ''
      })) || [],
      type: dbCustomer.type || 'residential',
      createdAt: dbCustomer.created_at,
      lastService: dbCustomer.last_service,
      status: dbCustomer.status || 'active' // Map status field
    };
  }
};

// Export the initialized client
export { supabase };
