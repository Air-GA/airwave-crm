
import { Customer, ServiceAddress } from "@/types";
import { CustomersGrid } from "./CustomersGrid";
import { CustomerDetails } from "./CustomerDetails";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerGridViewProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
}

export const CustomerGridView = ({ customers, onCustomerClick }: CustomerGridViewProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFullCustomerDetails = async (customerId: string) => {
    try {
      setIsLoading(true);
      
      // Find the customer in our local state first
      const localCustomer = customers.find(c => c.id === customerId);
      
      if (!localCustomer) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      
      // Use the local customer data as we already have it
      setSelectedCustomer(localCustomer);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast({
        title: "Error",
        description: `Could not load customer details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (customer: Customer) => {
    await fetchFullCustomerDetails(customer.id);
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
        isLoading={isLoading}
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
