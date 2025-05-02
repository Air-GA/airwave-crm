
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { useCustomerStore } from "@/services/customerStore/store";
import { useToast } from "@/hooks/use-toast";

// Function to sync three sample customers
export const syncThreeCustomers = async (): Promise<void> => {
  const { setCustomers, setIsLoading, setError } = useCustomerStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Sample residential customers
    const sampleCustomers: Customer[] = [
      {
        id: "sample-1",
        name: "Johnson Family",
        email: "johnsonf@example.com",
        phone: "555-123-4567",
        address: "123 Maple Street, Atlanta, GA",
        type: "residential",
        status: "active",
        serviceAddresses: [
          {
            id: "sa-1",
            address: "123 Maple Street, Atlanta, GA",
            isPrimary: true,
            notes: "Front door access code: 1234"
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "sample-2",
        name: "Sarah Wilson",
        email: "swilson@example.com",
        phone: "555-987-6543",
        address: "456 Oak Avenue, Marietta, GA",
        type: "residential",
        status: "active",
        serviceAddresses: [
          {
            id: "sa-2",
            address: "456 Oak Avenue, Marietta, GA",
            isPrimary: true,
            notes: ""
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "sample-3",
        name: "Rodriguez Family",
        email: "rodriguez@example.com",
        phone: "555-789-0123",
        address: "789 Pine Road, Alpharetta, GA",
        type: "residential",
        status: "active",
        serviceAddresses: [
          {
            id: "sa-3",
            address: "789 Pine Road, Alpharetta, GA",
            isPrimary: true,
            notes: "Beware of dog"
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];
    
    // Try to save to Supabase if connected
    try {
      // For each customer, try to insert or update in Supabase
      for (const customer of sampleCustomers) {
        const { error } = await supabase.client.from("customers").upsert({
          id: customer.id,
          name: customer.name,
          type: customer.type || 'residential',
          status: customer.status || 'active',
          created_at: customer.createdAt
        }, { onConflict: 'id' });
        
        if (error) {
          console.error("Error saving customer to Supabase:", error);
        } else {
          // Save service addresses
          for (const serviceAddress of customer.serviceAddresses || []) {
            await supabase.client.from("service_addresses").upsert({
              id: serviceAddress.id,
              customer_id: customer.id,
              address_line1: serviceAddress.address,
              name: serviceAddress.notes || null,
              location_code: serviceAddress.isPrimary ? 'primary' : 'secondary'
            }, { onConflict: 'id' });
          }
          
          // Save contact info
          await supabase.client.from("contacts").upsert({
            id: `contact-${customer.id}`,
            customer_id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            is_primary: true
          }, { onConflict: 'id' });
        }
      }
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      // Continue with local update even if Supabase fails
    }
    
    // Update the store
    setCustomers(sampleCustomers);
    
  } catch (error) {
    console.error("Error syncing customers:", error);
    setError(error instanceof Error ? error.message : "Failed to sync customers");
    throw error;
  } finally {
    setIsLoading(false);
  }
};
