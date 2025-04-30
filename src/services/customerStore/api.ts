
import { Customer } from "@/types";
import { customers as initialCustomers } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { formatCustomerData } from "./formatters";
import { useCustomerStore } from "./store";

// Fetch customers from Supabase or fall back to mock data
export const fetchCustomers = async (): Promise<Customer[]> => {
  const { setCustomers, setIsLoading, setError } = useCustomerStore.getState();
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from("customers")
      .select("*, service_addresses(*), contacts(*)");
      
    if (error) {
      console.error("Error fetching customers from Supabase:", error);
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
          address: `${sa.address_line1 || ''} ${sa.city || ''} ${sa.state || ''} ${sa.zip || ''}`,
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
      return formattedCustomers;
    }
    
    // Fall back to mock data
    console.log("No customers found in Supabase, using mock data");
    const formattedCustomers = initialCustomers.map(formatCustomerData);
    setCustomers(formattedCustomers);
    return formattedCustomers;
    
  } catch (error) {
    console.error("Error in fetchCustomers:", error);
    // Fall back to mock data
    const formattedCustomers = initialCustomers.map(formatCustomerData);
    setCustomers(formattedCustomers);
    return formattedCustomers;
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
      // Fall back to mock data
      const mockCustomer = initialCustomers.find(c => c.id === id);
      return mockCustomer ? formatCustomerData(mockCustomer) : null;
    }
    
    if (data) {
      const primaryContact = data.contacts?.find(c => c.is_primary === true) || data.contacts?.[0];
      
      const serviceAddresses = data.service_addresses?.map(sa => ({
        id: sa.id,
        address: `${sa.address_line1 || ''} ${sa.city || ''} ${sa.state || ''} ${sa.zip || ''}`,
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
    // Fall back to mock data
    const mockCustomer = initialCustomers.find(c => c.id === id);
    return mockCustomer ? formatCustomerData(mockCustomer) : null;
  }
};
