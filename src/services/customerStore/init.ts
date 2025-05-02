
import { useCustomerStore } from "./store";
import { fetchCustomers } from "./api";

// Initialize the store with empty data
export const initializeCustomerStore = () => {
  const { setCustomers } = useCustomerStore.getState();
  
  // Initialize with an empty array instead of mock data
  setCustomers([]);
};

// Update CustomersList page to use the store
export const updateCustomersList = async () => {
  // Initialize the store when the app starts
  initializeCustomerStore();
  // Fetch customers when needed
  await fetchCustomers();
};
