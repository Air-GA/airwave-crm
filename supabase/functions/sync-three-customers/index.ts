
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
    console.log("Syncing three customers function called");
    
    // Define three sample customers
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
        id: 'c2',
        name: 'Atlanta Technical College',
        email: 'maintenance@atcollege.edu',
        phone: '404-555-2345',
        address: '225 North Ave NW, Atlanta, GA 30332',
        type: 'commercial',
        created_at: new Date().toISOString(),
        service_addresses: [
          {
            address: '225 North Ave NW, Atlanta, GA 30332',
            is_primary: true,
            notes: 'Main campus building'
          },
          {
            address: '266 Ferst Drive, Atlanta, GA 30332',
            is_primary: false,
            notes: 'Satellite office'
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
      }
    ];
    
    // First clear existing customers
    console.log("Clearing existing customers...");
    
    // Delete all service_addresses (to avoid foreign key conflicts)
    const { error: deleteServiceAddressesError } = await supabase
      .from("service_addresses")
      .delete()
      .neq("customer_id", "none"); // Delete all
      
    if (deleteServiceAddressesError) {
      console.error("Error deleting service addresses:", deleteServiceAddressesError);
      throw deleteServiceAddressesError;
    }
    
    // Delete existing customers
    const { error: deleteCustomersError } = await supabase
      .from("customers")
      .delete()
      .neq("id", "none"); // Delete all
      
    if (deleteCustomersError) {
      console.error("Error deleting customers:", deleteCustomersError);
      throw deleteCustomersError;
    }
    
    console.log("Successfully cleared customers and service addresses");
    
    // Insert the new customers
    console.log("Inserting three sample customers...");
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
    
    console.log(`Successfully inserted ${insertedCustomers.length} customers`);
    
    // Insert service addresses for each customer
    let insertedAddresses = [];
    for (const customer of threeCustomers) {
      if (customer.service_addresses && customer.service_addresses.length > 0) {
        const addresses = customer.service_addresses.map(addr => ({
          customer_id: customer.id,
          address: addr.address,
          is_primary: addr.is_primary,
          notes: addr.notes
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
        message: `Synchronized 3 customers with ${insertedAddresses.length} service addresses`,
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
