
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
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};
