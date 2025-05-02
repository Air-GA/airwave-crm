
import { Customer } from "@/types";
import { supabase } from "@/lib/supabase";
import { useCustomerStore } from "@/services/customerStore";
import { formatCustomerData } from "./customerStore/formatters";
import { toast } from "sonner";

// Function to sync three sample residential customers to the database
export const syncThreeCustomers = async (): Promise<boolean> => {
  try {
    console.log("Starting sync of three sample residential customers");

    const response = await fetch(`https://anofwxgkmwhwshdqxfzb.functions.supabase.co/sync-three-customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub2Z3eGdrbXdod3NoZHF4ZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTk0NDIsImV4cCI6MjA1OTE5NTQ0Mn0.MjL9maVqFkUOYodFD86qsct8OnSE9Uog10KMVmxZd8Q`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Edge function error:", errorData);
      throw new Error(`Failed to sync customers: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Sync result:", result);
    
    // Refresh the customer store after sync
    const { setCustomers } = useCustomerStore.getState();
    
    // Get the updated customers from Supabase
    const { data, error } = await supabase
      .from("customers")
      .select("*, service_addresses(*), contacts(*)");
      
    if (error) {
      console.error("Error fetching updated customers:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      // Format the customers from Supabase
      const formattedCustomers = data.map(customer => {
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
    }

    return true;
  } catch (error) {
    console.error("Error syncing sample customers:", error);
    throw error;
  }
};

// Handle the sync button interactions
export const handleSyncClick = async (): Promise<boolean> => {
  try {
    toast("Syncing customers...");
    await syncThreeCustomers();
    toast.success("Customer sync completed successfully");
    return true;
  } catch (error) {
    console.error("Sync failed:", error);
    toast.error("Customer sync failed: " + (error instanceof Error ? error.message : "Unknown error"));
    return false;
  }
};
