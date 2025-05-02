
import { useCustomerStore } from "./store";
import { fetchCustomers } from "./api";

// Initialize the store 
export const initializeCustomerStore = () => {
  const { setCustomers, setIsLoading } = useCustomerStore.getState();
  
  try {
    setIsLoading(true);
    console.log("Initializing customer store...");
    
    // Initialize with empty array, we'll fetch real data after
    setCustomers([]);
    
    console.log("Customer store initialized with empty array. Will fetch data now.");
  } catch (error) {
    console.error("Error initializing customer store:", error);
    setCustomers([]);
  } finally {
    setIsLoading(false);
  }
};

// Update CustomersList page to use the store
export const updateCustomersList = async () => {
  // Initialize the store when the app starts
  initializeCustomerStore();
  
  // Then fetch real customers from Supabase
  try {
    console.log("Updating customers list with real data...");
    const customers = await fetchCustomers();
    console.log(`Updated customers list with ${customers.length} customers from API`);
    return customers;
  } catch (error) {
    console.error("Error updating customers list:", error);
    return [];
  }
};
