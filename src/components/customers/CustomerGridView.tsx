
import { Customer } from "@/types";
import { CustomersGrid } from "./CustomersGrid";
import { CustomerDetails } from "./CustomerDetails";
import { useState } from "react";

interface CustomerGridViewProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
}

export const CustomerGridView = ({ customers, onCustomerClick }: CustomerGridViewProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleCreateWorkOrder = (customer: Customer, serviceAddress?: string) => {
    console.log("Creating work order for", customer.name, "at address:", serviceAddress);
    onCustomerClick(customer.id);
  };

  return (
    <>
      <CustomersGrid 
        customers={customers}
        onCustomerClick={(customer) => onCustomerClick(customer.id)}
        onViewDetails={handleViewDetails}
        onCreateWorkOrder={handleCreateWorkOrder}
      />
      
      {selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onCreateWorkOrder={handleCreateWorkOrder}
          permissions={{
            canViewCustomerPaymentHistory: true,
            canViewFuturePaymentPlans: true,
          }}
        />
      )}
    </>
  );
};
