
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
    
    // Convert the database customers to our Customer type
    const customers = data.data.customers.map(dbCustomer => 
      supabase.formatDbToCustomer(dbCustomer)
    );
    
    console.log("Successfully synced customers:", customers);
    return customers;
  } catch (error) {
    console.error("Error in syncThreeCustomers:", error);
    // Rethrow to allow the component to handle the error
    throw error;
  }
};

// Fallback function to get static customers if sync fails
export const getStaticCustomers = (): Customer[] => {
  return [
    {
      id: "c1",
      name: "Johnson Family",
      email: "johnson@example.com",
      phone: "404-555-1234",
      address: "123 Maple Street, Atlanta, GA",
      billAddress: "123 Maple Street, Atlanta, GA",
      serviceAddresses: [
        { id: "addr-1", address: "123 Maple Street, Atlanta, GA", isPrimary: true, notes: "Main residence" }
      ],
      type: "residential",
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "c2",
      name: "Atlanta Technical College",
      email: "maintenance@atcollege.edu",
      phone: "678-555-2345",
      address: "225 North Ave NW, Atlanta, GA 30332",
      billAddress: "PO Box 34578, Atlanta, GA 30332",
      serviceAddresses: [
        { id: "addr-2", address: "225 North Ave NW, Atlanta, GA 30332", isPrimary: true, notes: "Main campus" },
        { id: "addr-3", address: "266 Ferst Drive, Atlanta, GA 30332", isPrimary: false, notes: "Satellite office" }
      ],
      type: "commercial",
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "c3",
      name: "Sarah Wilson",
      email: "swilson@gmail.com",
      phone: "678-555-3456",
      address: "456 Oak Avenue, Marietta, GA",
      billAddress: "456 Oak Avenue, Marietta, GA",
      serviceAddresses: [
        { id: "addr-4", address: "456 Oak Avenue, Marietta, GA", isPrimary: true, notes: "Home address" }
      ],
      type: "residential",
      createdAt: new Date().toISOString(),
      lastService: null
    }
  ];
};
