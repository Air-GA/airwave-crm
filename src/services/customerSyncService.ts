
import { supabase } from "@/lib/supabase";
import { useCustomerStore } from "@/services/customerStore";
import { formatCustomerData } from "./customerStore/formatters";
import { fetchCustomers } from "./customerStore";
import { toast } from "sonner";

// Function to sync three sample customers to the database
export const syncThreeCustomers = async (): Promise<boolean> => {
  try {
    console.log("Starting sync of three sample customers");

    // Call the edge function to sync data
    const { data, error } = await supabase.functions.invoke('sync-three-customers', {
      method: 'POST'
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Failed to sync customers: ${error.message}`);
    }

    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from sync operation");
    }

    console.log("Sync result:", data);
    
    // Refresh the customer store after sync
    const { setCustomers, setIsLoading } = useCustomerStore.getState();
    
    // Update loading state
    setIsLoading(true);
    
    // Get the updated customers from Supabase
    const { data: customersData, error: fetchError } = await supabase
      .from("customers")
      .select("*, service_addresses(*), contacts(*)");
      
    if (fetchError) {
      console.error("Error fetching updated customers:", fetchError);
      throw fetchError;
    }
    
    if (customersData && customersData.length > 0) {
      console.log(`Retrieved ${customersData.length} customers from database after sync`);
      
      // Format the customers from Supabase
      const formattedCustomers = customersData.map(customer => {
        // Find primary contact for email/phone
        const primaryContact = customer.contacts?.find(c => c.is_primary === true) || customer.contacts?.[0];
        
        // Map service addresses to our format
        const serviceAddresses = customer.service_addresses?.map(sa => ({
          id: sa.id,
          address: `${sa.address_line1 || ''} ${sa.city || ''} ${sa.state || ''} ${sa.zip || ''}`.trim(),
          isPrimary: sa.location_code === 'primary' || false,
          notes: sa.name || ''
        })) || [];
        
        // Generate a combined address string for the primary address
        const addressStr = serviceAddresses.find(addr => addr.isPrimary)?.address || 
                          serviceAddresses[0]?.address || '';
                          
        return formatCustomerData({
          id: customer.id,
          name: customer.name || "Unknown",
          email: primaryContact?.email || "",
          phone: primaryContact?.phone || "",
          address: addressStr,
          billAddress: customer.billing_address_line1 || "",
          billCity: customer.billing_city || "",
          serviceAddresses: serviceAddresses,
          type: (customer.status?.includes('commercial') ? 'commercial' : 'residential'),
          status: customer.status || "active",
          createdAt: customer.created_at || new Date().toISOString(),
          lastService: ""
        });
      });
      
      setCustomers(formattedCustomers);
      console.log(`Updated store with ${formattedCustomers.length} customers`);
      
      setIsLoading(false);
    } else {
      console.log("No customers found after sync");
      setCustomers([]);
      setIsLoading(false);
    }

    return true;
  } catch (error) {
    console.error("Error syncing sample customers:", error);
    throw error;
  }
};

// Add the handleSyncClick function that was missing
export const handleSyncClick = async (): Promise<boolean> => {
  try {
    console.log("Syncing customers data...");
    toast("Syncing customers data...");
    
    // Fetch the latest customers from Supabase
    const customers = await fetchCustomers();
    
    console.log(`Synced ${customers.length} customers`);
    toast.success(`Successfully synced ${customers.length} customers`);
    return true;
  } catch (error) {
    console.error("Error syncing customers:", error);
    toast.error(error instanceof Error ? error.message : "Failed to sync customers");
    return false;
  }
};
