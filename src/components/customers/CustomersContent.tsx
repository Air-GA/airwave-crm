
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerListView } from "./CustomerListView";
import { CustomerGridView } from "./CustomerGridView";
import { Customer } from "@/types";

interface CustomersContentProps {
  isLoading: boolean;
  customers: Customer[];
  viewMode: "grid" | "list";
  onCustomerClick: (customerId: string) => void;
  onAddCustomer: () => void;
}

export const CustomersContent = ({
  isLoading,
  customers,
  viewMode,
  onCustomerClick,
  onAddCustomer,
}: CustomersContentProps) => {
  if (isLoading) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full">
            <Skeleton className="h-40 w-full rounded-lg mb-2" />
          </div>
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-40 space-y-2">
          <p className="text-center text-muted-foreground">No customers found.</p>
          <Button onClick={onAddCustomer} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </Card>
    );
  }

  return viewMode === "grid" ? (
    <CustomerGridView 
      customers={customers}
      onCustomerClick={onCustomerClick}
    />
  ) : (
    <CustomerListView 
      customers={customers}
      onCustomerClick={onCustomerClick}
    />
  );
};
