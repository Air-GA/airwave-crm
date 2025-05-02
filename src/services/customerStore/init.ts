
import { useCustomerStore } from "./store";
import { fetchCustomers } from "./api";
import { customers as mockCustomers } from "@/data/mockData";
import { formatCustomerData } from "./formatters";

// Initialize the store with either mock data or empty array
export const initializeCustomerStore = () => {
  const { setCustomers } = useCustomerStore.getState();
  
  try {
    // Check if we should initialize with mock data or empty array
    // For now, we'll use mock data to ensure there's always some data available
    const initialCustomers = mockCustomers.map(formatCustomerData);
    setCustomers(initialCustomers);
    console.log(`Initialized store with ${initialCustomers.length} mock customers`);
  } catch (error) {
    console.error("Error initializing customer store:", error);
    // If error, initialize with empty array
    setCustomers([]);
  }
};

// Update CustomersList page to use the store
export const updateCustomersList = async () => {
  // Initialize the store when the app starts
  initializeCustomerStore();
  
  // Then try to fetch real customers from Supabase
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
