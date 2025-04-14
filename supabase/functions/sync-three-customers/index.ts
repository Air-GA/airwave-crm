
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Syncing three residential customers function called");
    
    // Define three sample residential customers
    const threeCustomers = [
      {
        id: 'c1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '404-555-1234',
        address: '123 Main St, Atlanta, GA 30301',
        type: 'residential',
        created_at: new Date().toISOString(),
        service_addresses: [
          {
            address: '123 Main St, Atlanta, GA 30301',
            is_primary: true,
            notes: 'Primary residence'
          }
        ]
      },
      {
        id: 'c3',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '404-555-3456',
        address: '456 Oak Dr, Marietta, GA 30060',
        type: 'residential',
        created_at: new Date().toISOString(),
        service_addresses: [
          {
            address: '456 Oak Dr, Marietta, GA 30060',
            is_primary: true,
            notes: 'Home address'
          }
        ]
      },
      {
        id: 'c5',
        name: 'Thomas Family',
        email: 'thomasfamily@outlook.com',
        phone: '770-555-7890',
        address: '789 Pine Road, Alpharetta, GA',
        type: 'residential',
        created_at: new Date().toISOString(),
        service_addresses: [
          {
            address: '789 Pine Road, Alpharetta, GA',
            is_primary: true,
            notes: 'Beware of dog'
          }
        ]
      }
    ];
    
    // First try to clear existing data with a direct SQL query instead of using LIKE operator
    console.log("Clearing existing customers...");
    
    try {
      // Delete all service_addresses
      const { error: deleteServiceAddressesError } = await supabase
        .from("service_addresses")
        .delete()
        .not('id', 'is', null); // Delete all records
        
      if (deleteServiceAddressesError) {
        console.error("Error deleting service addresses:", deleteServiceAddressesError);
        throw deleteServiceAddressesError;
      }
      
      // Delete all customers
      const { error: deleteCustomersError } = await supabase
        .from("customers")
        .delete()
        .not('id', 'is', null); // Delete all records
        
      if (deleteCustomersError) {
        console.error("Error deleting customers:", deleteCustomersError);
        throw deleteCustomersError;
      }
      
      console.log("Successfully cleared customers and service addresses");
    } catch (clearError) {
      console.error("Error clearing existing data:", clearError);
      // Continue with inserts even if clear fails
    }
    
    // Insert the new customers
    console.log("Inserting three sample residential customers...");
    const customersToInsert = threeCustomers.map(customer => {
      const { service_addresses, ...customerData } = customer;
      return customerData;
    });
    
    const { data: insertedCustomers, error: insertCustomersError } = await supabase
      .from("customers")
      .upsert(customersToInsert)
      .select();
      
    if (insertCustomersError) {
      console.error("Error inserting customers:", insertCustomersError);
      throw insertCustomersError;
    }
    
    console.log(`Successfully inserted ${insertedCustomers?.length || 0} customers`);
    
    // Insert service addresses for each customer
    let insertedAddresses = [];
    for (const customer of threeCustomers) {
      if (customer.service_addresses && customer.service_addresses.length > 0) {
        const addresses = customer.service_addresses.map(addr => ({
          customer_id: customer.id,
          address: addr.address,
          is_primary: addr.is_primary,
          notes: addr.notes || '',
        }));
        
        const { data: addressData, error: addressError } = await supabase
          .from("service_addresses")
          .upsert(addresses)
          .select();
          
        if (addressError) {
          console.error(`Error inserting service addresses for customer ${customer.id}:`, addressError);
          throw addressError;
        }
        
        if (addressData) {
          insertedAddresses = [...insertedAddresses, ...addressData];
        }
      }
    }
    
    console.log(`Successfully inserted ${insertedAddresses.length} service addresses`);
    
    return new Response(
      JSON.stringify({
        status: "success",
        message: `Synchronized 3 residential customers with ${insertedAddresses.length} service addresses`,
        data: {
          customers: insertedCustomers,
          addresses: insertedAddresses
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in sync-three-customers function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
