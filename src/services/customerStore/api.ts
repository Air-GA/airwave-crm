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
    
    // Fetch all customers from Supabase
    const { data, error } = await supabase
      .from("customers")
      .select("*, service_addresses(*), contacts(*)")
      .order('name');
      
    if (error) {
      console.error("Error fetching customers from Supabase:", error);
      throw error;
    }
    
    if (!data) {
      console.log("No data returned from Supabase");
      setCustomers([]);
      return [];
    }
    
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

// Add a new customer to Supabase and update the store
export const addCustomer = async (customer: Customer): Promise<Customer | null> => {
  try {
    console.log("Adding new customer to Supabase:", customer);
    
    // Format the customer data for Supabase
    const customerData = {
      id: customer.id,
      name: customer.name,
      billing_address_line1: customer.billAddress,
      status: customer.type === 'commercial' ? 'commercial' : 'residential',
      created_at: new Date().toISOString()
    };
    
    // Insert the customer into Supabase
    const { data: customerResult, error: customerError } = await supabase
      .from("customers")
      .insert(customerData)
      .select("*")
      .single();
      
    if (customerError) {
      console.error("Error adding customer:", customerError);
      throw customerError;
    }
    
    console.log("Customer added successfully:", customerResult);
    
    // Create service addresses for the customer
    if (customer.serviceAddresses && customer.serviceAddresses.length > 0) {
      const serviceAddressPromises = customer.serviceAddresses.map(async (addr) => {
        const { data: saData, error: saError } = await supabase
          .from("service_addresses")
          .insert({
            customer_id: customer.id,
            address_line1: addr.address,
            location_code: addr.isPrimary ? 'primary' : 'secondary',
            name: addr.notes || '',
            created_at: new Date().toISOString()
          })
          .select("*");
          
        if (saError) {
          console.error("Error adding service address:", saError);
          throw saError;
        }
        
        return saData;
      });
      
      await Promise.all(serviceAddressPromises);
      console.log("Service addresses added successfully");
    }
    
    // Create a primary contact for the customer
    if (customer.email || customer.phone) {
      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .insert({
          customer_id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          is_primary: true,
          created_at: new Date().toISOString()
        })
        .select("*");
        
      if (contactError) {
        console.error("Error adding contact:", contactError);
        throw contactError;
      }
      
      console.log("Contact added successfully:", contactData);
    }
    
    // Refresh the customer store
    await fetchCustomers();
    
    return customer;
  } catch (error) {
    console.error("Error in addCustomer:", error);
    return null;
  }
};
