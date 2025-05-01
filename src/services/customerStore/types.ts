
import { Customer } from "@/types";

export interface CustomerState {
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
