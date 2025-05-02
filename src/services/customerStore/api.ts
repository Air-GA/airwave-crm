
import { Customer } from "@/types";
import { supabase } from "@/lib/supabase";
import { formatCustomerData } from "./formatters";
import { useCustomerStore } from "./store";

// Fetch customers from Supabase
export const fetchCustomers = async (): Promise<Customer[]> => {
  const { setCustomers, setIsLoading, setError } = useCustomerStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    console.log("Fetching customers from Supabase...");
    
    // Fetch all customers from Supabase - pagination may be needed for 20k+ customers
    const { data, error } = await supabase
      .from("customers")
      .select("*, service_addresses(*), contacts(*)")
      .order('name');
      
    if (error) {
      console.error("Error fetching customers from Supabase:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} customers from Supabase`);
      
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
      
      console.log(`Formatted ${formattedCustomers.length} customers to display`);
      setCustomers(formattedCustomers);
      return formattedCustomers;
    } else {
      console.warn("No customers found in Supabase");
      setCustomers([]);
      return [];
    }
    
  } catch (error) {
    console.error("Error in fetchCustomers:", error);
    setError(error instanceof Error ? error.message : "Unknown error fetching customers");
    setCustomers([]);
    return [];
  } finally {
    setIsLoading(false);
  }
};

// Get a single customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { customers } = useCustomerStore.getState();
  
  // First check if we already have the customer in state
  const existingCustomer = customers.find(c => c.id === id);
  if (existingCustomer) {
    return existingCustomer;
  }
  
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from("customers")
      .select("*, service_addresses(*), contacts(*)")
      .eq("id", id)
      .single();
      
    if (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      return null;
    }
    
    if (data) {
      const primaryContact = data.contacts?.find(c => c.is_primary === true) || data.contacts?.[0];
      
      const serviceAddresses = data.service_addresses?.map(sa => ({
        id: sa.id,
        address: `${sa.address_line1 || ''} ${sa.city || ''} ${sa.state || ''} ${sa.zip || ''}`.trim(),
        isPrimary: sa.location_code === 'primary' || false,
        notes: sa.name || ''
      })) || [];
      
      const customer = formatCustomerData({
        id: data.id,
        name: data.name || "Unknown",
        email: primaryContact?.email || "",
        phone: primaryContact?.phone || "",
        address: serviceAddresses.find(addr => addr.isPrimary)?.address || serviceAddresses[0]?.address || "",
        billAddress: data.billing_address_line1 || "",
        billCity: data.billing_city || "",
        serviceAddresses: serviceAddresses,
        type: (data.status?.includes('commercial') ? 'commercial' : 'residential'),
        status: data.status || "active",
        createdAt: data.created_at || new Date().toISOString(),
        lastService: ""
      });
      
      return customer;
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getCustomerById for ID ${id}:`, error);
    return null;
  }
};
