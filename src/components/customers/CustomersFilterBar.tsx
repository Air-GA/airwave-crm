
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomersFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  customersCount: number;
  onAddCustomer: () => void;
  canAddCustomer: boolean;
  userRole: string;
}

export const CustomersFilterBar = ({
  searchQuery,
  setSearchQuery,
  customersCount,
  onAddCustomer,
  canAddCustomer,
  userRole
}: CustomersFilterBarProps) => {
  // Only show search for non-customer users
  if (userRole === 'customer') {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-8 w-full md:max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
        <span>{customersCount} customers</span>
      </div>

      {canAddCustomer && (
        <Button onClick={onAddCustomer} className="md:ml-2">
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      )}
    </div>
  );
};
