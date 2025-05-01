
import { create } from "zustand";
import { CustomerState } from "./types";
import { Customer } from "@/types";

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
