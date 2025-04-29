
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
      
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (customerError) {
        throw new Error(`Error fetching customer: ${customerError.message}`);
      }
      
      // Fetch service addresses for this customer
      const { data: serviceAddressesData, error: addressesError } = await supabase
        .from('service_addresses')
        .select('*')
        .eq('customer_id', customerId);
        
      if (addressesError) {
        throw new Error(`Error fetching service addresses: ${addressesError.message}`);
      }
      
      // Transform service addresses to match our app's format
      const serviceAddresses: ServiceAddress[] = serviceAddressesData.map(addr => ({
        id: addr.id,
        address: `${addr.address_line1 || ''} ${addr.address_line2 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim(),
        isPrimary: addr.location_code === 'primary' || false,
        notes: addr.name || ''
      }));
      
      // Get primary contact info if available
      let email = '';
      let phone = '';
      
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('*')
        .eq('customer_id', customerId);
        
      if (contactsData && contactsData.length > 0) {
        const primaryContact = contactsData.find(c => c.is_primary) || contactsData[0];
        email = primaryContact.email || '';
        phone = primaryContact.phone || '';
      }
      
      // Create combined customer object
      const fullCustomer: Customer = {
        id: customerData.id,
        name: customerData.name || 'Unknown',
        email: email,
        phone: phone,
        address: serviceAddresses.find(addr => addr.isPrimary)?.address || '',
        billAddress: customerData.billing_address_line1 || '',
        billCity: customerData.billing_city || '',
        serviceAddresses: serviceAddresses,
        type: (customerData.status?.includes('commercial') ? 'commercial' : 'residential') as Customer["type"],
        status: (customerData.status as Customer["status"]) || "active",
        createdAt: customerData.created_at || new Date().toISOString(),
        lastService: ""  // No direct mapping for this field
      };
      
      setSelectedCustomer(fullCustomer);
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
