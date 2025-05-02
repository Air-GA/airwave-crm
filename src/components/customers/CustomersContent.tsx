
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Customer } from "@/types";
import { CustomerListView } from "./CustomerListView";
import { CustomerGridView } from "./CustomerGridView";
import { CustomerEmptyState } from "./CustomerEmptyState";

interface CustomersContentProps {
  isLoading: boolean;
  customers: Customer[];
  viewMode: "grid" | "list";
  onCustomerClick: (customerId: string) => void;
  onAddCustomer: () => void;
  userRole?: string;
}

export const CustomersContent = ({
  isLoading,
  customers,
  viewMode,
  onCustomerClick,
  onAddCustomer,
  userRole = "admin",
}: CustomersContentProps) => {
  console.log("CustomersContent rendering with", customers.length, "customers, viewMode:", viewMode, "isLoading:", isLoading);

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

  if (!customers || customers.length === 0) {
    console.log("No customers to display, showing empty state");
    return (
      <CustomerEmptyState 
        userRole={userRole}
        onAddCustomer={onAddCustomer}
        canAddCustomer={true}
      />
    );
  }

  console.log(`Rendering ${viewMode} view with ${customers.length} customers`);
  
  return viewMode === "grid" ? (
    <CustomerGridView 
      customers={customers}
      onCustomerClick={onCustomerClick}
    />
  ) : (
    <CustomerListView 
      customers={customers}
      onCustomerClick={onCustomerClick}
      onViewDetails={(customer) => {
        console.log("View details clicked for customer:", customer.id);
        onCustomerClick(customer.id);
      }}
    />
  );
};
