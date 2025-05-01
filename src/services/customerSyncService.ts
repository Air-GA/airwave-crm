
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
      console.log("No residential customers found");
      return [];
    }
    
    console.log("Successfully synced residential customers:", customers);
    return customers;
  } catch (error) {
    console.error("Error in syncThreeCustomers:", error);
    // Rethrow to allow the component to handle the error
    throw error;
  }
};

// Function to get a specific customer by ID
export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
  try {
    // Try to fetch from database
    const { data, error } = await supabase.client
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    
    if (error) {
      console.error("Error fetching customer from database:", error);
      return null;
    }
    
    return supabase.formatDbToCustomer(data);
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    throw error;
  }
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
