
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";

export const syncThreeCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Calling sync-three-customers function...");
    const { data, error } = await supabase.functions.invoke('sync-three-customers');
    
    if (error) {
      console.error("Error syncing three customers:", error);
      throw new Error(`Failed to sync customers: ${error.message}`);
    }
    
    if (!data || !data.data || !data.data.customers) {
      console.error("Invalid response from sync function:", data);
      throw new Error("Invalid response from sync function");
    }
    
    // Convert the database customers to our Customer type and filter for residential only
    const customers = data.data.customers
      .map(dbCustomer => supabase.formatDbToCustomer(dbCustomer))
      .filter(customer => customer.type === 'residential');
    
    if (customers.length === 0) {
      console.log("No residential customers found, falling back to static data");
      return getStaticCustomers();
    }
    
    console.log("Successfully synced residential customers:", customers);
    return customers;
  } catch (error) {
    console.error("Error in syncThreeCustomers:", error);
    // Rethrow to allow the component to handle the error
    throw error;
  }
};

// Fallback function to get static customers if sync fails
export const getStaticCustomers = (): Customer[] => {
  // Only return residential customers
  return [
    {
      id: "c1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "404-555-1234",
      address: "123 Main St, Atlanta, GA 30301",
      billAddress: "123 Main St, Atlanta, GA 30301",
      serviceAddresses: [
        { id: "addr-1", address: "123 Main St, Atlanta, GA 30301", isPrimary: true, notes: "Primary residence" }
      ],
      type: "residential",
      status: "active",
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "c3",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "404-555-3456",
      address: "456 Oak Dr, Marietta, GA 30060",
      billAddress: "456 Oak Dr, Marietta, GA 30060",
      serviceAddresses: [
        { id: "addr-4", address: "456 Oak Dr, Marietta, GA 30060", isPrimary: true, notes: "Home address" }
      ],
      type: "residential",
      status: "active",
      createdAt: new Date().toISOString(),
      lastService: null
    },
    {
      id: "c5",
      name: "Thomas Family",
      email: "thomasfamily@outlook.com",
      phone: "770-555-7890",
      address: "789 Pine Road, Alpharetta, GA",
      billAddress: "789 Pine Road, Alpharetta, GA",
      serviceAddresses: [
        { id: "addr-5", address: "789 Pine Road, Alpharetta, GA", isPrimary: true, notes: "Beware of dog" }
      ],
      type: "residential",
      status: "active",
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Add function to update a customer both locally and in the database
export const updateCustomer = async (updatedCustomer: Customer): Promise<Customer> => {
  try {
    console.log("Updating customer:", updatedCustomer);
    
    // Format customer for DB
    const dbCustomer = supabase.formatCustomerForDb(updatedCustomer);
    
    // Update in Supabase
    const { data, error } = await supabase.client
      .from("customers")
      .update(dbCustomer)
      .eq("id", updatedCustomer.id)
      .select();
    
    if (error) {
      console.error("Error updating customer in database:", error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }
    
    // If customer has service addresses, update them as well
    if (updatedCustomer.serviceAddresses && updatedCustomer.serviceAddresses.length > 0) {
      // First delete existing service addresses to avoid duplicates
      const { error: deleteError } = await supabase.client
        .from("service_addresses")
        .delete()
        .eq("customer_id", updatedCustomer.id);
      
      if (deleteError) {
        console.error("Error deleting existing service addresses:", deleteError);
      }
      
      // Insert updated service addresses
      const serviceAddresses = updatedCustomer.serviceAddresses.map(addr => ({
        customer_id: updatedCustomer.id,
        address: addr.address,
        is_primary: addr.isPrimary || false,
        notes: addr.notes || ''
      }));
      
      const { error: insertError } = await supabase.client
        .from("service_addresses")
        .insert(serviceAddresses);
      
      if (insertError) {
        console.error("Error inserting updated service addresses:", insertError);
      }
    }
    
    console.log("Customer successfully updated:", data);
    
    // Return the updated customer
    return updatedCustomer;
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    throw error;
  }
};

// Function to get a specific customer by ID
export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
  try {
    // First try to get from database
    const { data, error } = await supabase.client
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    
    if (error) {
      console.error("Error fetching customer from database:", error);
      
      // Try to find in static data
      const staticCustomers = getStaticCustomers();
      const staticCustomer = staticCustomers.find(c => c.id === customerId);
      
      if (staticCustomer) {
        return staticCustomer;
      }
      
      throw new Error(`Customer not found: ${error.message}`);
    }
    
    return supabase.formatDbToCustomer(data);
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    throw error;
  }
};
