import { create } from "zustand";
import { Customer, ServiceAddress } from "@/types";
import { customers as initialCustomers } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

interface CustomerState {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  filteredCustomers: Customer[];
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  setCustomers: (customers) => set({ customers }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  searchFilter: '',
  setSearchFilter: (query) => set({ searchFilter: query }),
  get filteredCustomers() {
    const { customers, searchFilter } = get();
    if (!searchFilter.trim()) return customers;
    
    const lowerCaseQuery = searchFilter.toLowerCase();
    return customers.filter(customer => {
      return (
        customer.name?.toLowerCase().includes(lowerCaseQuery) ||
        customer.email?.toLowerCase().includes(lowerCaseQuery) ||
        customer.phone?.toLowerCase().includes(lowerCaseQuery) ||
        customer.address?.toLowerCase().includes(lowerCaseQuery) ||
        customer.billCity?.toLowerCase().includes(lowerCaseQuery) ||
        customer.serviceAddresses?.some(addr => 
          addr.address.toLowerCase().includes(lowerCaseQuery)
        )
      );
    });
  }
}));

// Format customer data consistently across the app
export const formatCustomerData = (customer: any): Customer => {
  // Map service addresses to the expected format
  const serviceAddresses = customer.serviceAddresses?.map(addr => ({
    id: addr.id || `addr-${Math.random().toString(36).substring(2, 11)}`,
    address: addr.address || '',
    isPrimary: typeof addr.isPrimary === 'boolean' ? addr.isPrimary : true,
    notes: addr.notes || ''
  })) || [];

  // Ensure the primary address is available
  const primaryAddress = serviceAddresses.find(addr => addr.isPrimary)?.address ||
    serviceAddresses[0]?.address ||
    customer.address || '';

  // Format the customer object with all required fields
  return {
    id: customer.id,
    name: customer.name || 'Unknown',
    email: customer.email || '',
    phone: customer.phone || '',
    address: primaryAddress,
    billAddress: customer.billAddress || '',
    billCity: customer.billCity || '',
    serviceAddresses: serviceAddresses,
    type: (customer.type === 'commercial' ? 'commercial' : 'residential') as Customer["type"],
    status: (customer.status === 'active' || customer.status === 'inactive' || 
             customer.status === 'pending' || customer.status === 'new') ? 
             customer.status as Customer["status"] : 'active',
    createdAt: customer.createdAt || new Date().toISOString(),
    lastService: customer.lastService || null
  };
};

// Initialize the store with data from mockData
export const initializeCustomerStore = () => {
  const { setCustomers, setIsLoading } = useCustomerStore.getState();
  
  // Format the initial customers data consistently
  const formattedCustomers = initialCustomers.map(formatCustomerData);
  
  setCustomers(formattedCustomers);
};

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

// Update CustomersList page to use the store
export const updateCustomersList = () => {
  // Initialize the store when the app starts
  initializeCustomerStore();
  // Fetch customers when needed
  fetchCustomers();
};
