
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    console.log("Syncing three residential customers function called");
    
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    
    // Clear existing data first
    console.log("Clearing existing customers...");
    
    // Delete in the right order to not violate foreign key constraints
    await supabaseClient.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('service_addresses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Successfully cleared customers and service addresses");
    
    // Insert three sample customers
    console.log("Inserting three sample residential customers...");
    
    // 1. Create customers
    const { data: customers, error: customerError } = await supabaseClient.from('customers').insert([
      { name: 'John Smith', billing_address_line1: '123 Main St', billing_city: 'Springfield', billing_state: 'IL', billing_zip: '62704', status: 'active' },
      { name: 'Jane Doe', billing_address_line1: '456 Elm St', billing_city: 'Shelbyville', billing_state: 'IL', billing_zip: '62565', status: 'active' },
      { name: 'Bob Johnson', billing_address_line1: '789 Oak St', billing_city: 'Capital City', billing_state: 'IL', billing_zip: '62701', status: 'residential_active' }
    ]).select();
    
    if (customerError) {
      console.error("Error inserting customers:", customerError);
      throw customerError;
    }
    
    if (!customers || customers.length === 0) {
      throw new Error("No customers were created");
    }
    
    // 2. Create service addresses for each customer
    const serviceAddresses = [];
    
    for (const customer of customers) {
      serviceAddresses.push(
        { 
          customer_id: customer.id, 
          address_line1: customer.billing_address_line1, 
          city: customer.billing_city,
          state: customer.billing_state,
          zip: customer.billing_zip,
          location_code: 'primary' 
        }
      );
    }
    
    const { error: addressError } = await supabaseClient.from('service_addresses').insert(serviceAddresses);
    
    if (addressError) {
      console.error("Error inserting service addresses:", addressError);
      throw addressError;
    }
    
    // 3. Create contacts for each customer
    const { data: serviceAddressesData, error: serviceAddressesError } = await supabaseClient
      .from('service_addresses')
      .select('*')
      .in('customer_id', customers.map(c => c.id));
    
    if (serviceAddressesError) {
      console.error("Error fetching service addresses:", serviceAddressesError);
      throw serviceAddressesError;
    }
    
    const contacts = [];
    for (let i = 0; i < customers.length; i++) {
      contacts.push({
        customer_id: customers[i].id,
        service_address_id: serviceAddressesData[i].id,
        name: customers[i].name,
        email: `${customers[i].name.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        is_primary: true
      });
    }
    
    const { error: contactError } = await supabaseClient.from('contacts').insert(contacts);
    
    if (contactError) {
      console.error("Error inserting contacts:", contactError);
      throw contactError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully created 3 sample customers with service addresses and contacts",
        customers: customers.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
    
  } catch (error) {
    console.error("Error in sync-three-customers function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
