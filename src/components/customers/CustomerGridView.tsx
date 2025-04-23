
import { Customer } from "@/types";
import { CustomerCard } from "./CustomerCard";

interface CustomerGridViewProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
}

export const CustomerGridView = ({ customers, onCustomerClick }: CustomerGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onClick={() => onCustomerClick(customer.id)}
          onViewDetails={() => onCustomerClick(customer.id)}
        />
      ))}
    </div>
  );
};
