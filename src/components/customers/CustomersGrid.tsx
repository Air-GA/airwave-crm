
import { Customer } from "@/types";
import { CustomerCard } from "./CustomerCard";

interface CustomersGridProps {
  customers: Customer[];
  onCustomerClick: (customer: Customer) => void;
  onViewDetails: (customer: Customer) => void;
  onCreateWorkOrder: (customer: Customer, serviceAddress?: string) => void;
}

export const CustomersGrid = ({ 
  customers,
  onCustomerClick,
  onViewDetails,
  onCreateWorkOrder
}: CustomersGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard 
          key={customer.id} 
          customer={customer} 
          onClick={() => onCustomerClick(customer)}
          onViewDetails={() => onViewDetails(customer)}
          onCreateWorkOrder={(serviceAddress) => onCreateWorkOrder(customer, serviceAddress)}
        />
      ))}
    </div>
  );
};
