
import { useCustomerStore } from "./store";
import { fetchCustomers } from "./api";

// Initialize the store with empty data
export const initializeCustomerStore = () => {
  const { setCustomers } = useCustomerStore.getState();
  setCustomers([]);
};

// Update CustomersList page to use the store
export const updateCustomersList = () => {
  // Initialize the store when the app starts
  initializeCustomerStore();
  // Fetch customers from Supabase
  fetchCustomers();
};
