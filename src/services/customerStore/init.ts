
import { customers as initialCustomers } from "@/data/mockData";
import { formatCustomerData } from "./formatters";
import { useCustomerStore } from "./store";
import { fetchCustomers } from "./api";

// Initialize the store with data from mockData
export const initializeCustomerStore = () => {
  const { setCustomers } = useCustomerStore.getState();
  
  // Format the initial customers data consistently
  const formattedCustomers = initialCustomers.map(formatCustomerData);
  
  setCustomers(formattedCustomers);
};

// Update CustomersList page to use the store
export const updateCustomersList = () => {
  // Initialize the store when the app starts
  initializeCustomerStore();
  // Fetch customers when needed
  fetchCustomers();
};
