
import { Customer } from "@/types";
import { CustomerCard } from "./CustomerCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersGridProps {
  customers: Customer[];
  onCustomerClick: (customer: Customer) => void;
  onViewDetails: (customer: Customer) => void;
  onCreateWorkOrder: (customer: Customer, serviceAddress?: string) => void;
  isLoading?: boolean;
}

export const CustomersGrid = ({ 
  customers,
  onCustomerClick,
  onViewDetails,
  onCreateWorkOrder,
  isLoading = false
}: CustomersGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[220px]">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard 
          key={customer.id} 
          customer={customer} 
          onClick={() => onCustomerClick(customer)}
          onViewDetails={() => onViewDetails(customer)}
          onCreateWorkOrder={(serviceAddress) => onCreateWorkOrder(customer, serviceAddress)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
