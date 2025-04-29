import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { CustomerFilterDialog } from "@/components/customers/CustomerFilterDialog";
import { CustomersHeader } from "@/components/customers/CustomersHeader";
import { CustomersToolbar } from "@/components/customers/CustomersToolbar";
import { CustomersContent } from "@/components/customers/CustomersContent";
import { CustomerDetails } from "@/components/customers/CustomerDetails";

const CustomersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        // Fetch customers from Supabase
        const { data, error } = await supabase
          .from("customers")
          .select("*, service_addresses(*), contacts(*)");

        if (error) {
          console.error("Error fetching customers:", error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Fetched customers from Supabase:", data);
          // Map the Supabase data to our Customer type
          const transformedData: Customer[] = data.map(customer => {
            // Find primary contact for email/phone
            const primaryContact = customer.contacts?.find(c => c.is_primary === true) || customer.contacts?.[0];
            
            // Get primary service address
            const primaryAddress = customer.service_addresses?.find(sa => sa.name === 'primary' || sa.location_code === 'primary') || 
                                  customer.service_addresses?.[0];
            
            // Generate a combined address string
            const addressStr = primaryAddress ? 
              `${primaryAddress.address_line1 || ''} ${primaryAddress.city || ''} ${primaryAddress.state || ''}` : '';
            
            // Map service addresses to our ServiceAddress type
            const serviceAddresses = customer.service_addresses?.map(sa => ({
              id: sa.id,
              address: `${sa.address_line1 || ''} ${sa.city || ''} ${sa.state || ''} ${sa.zip || ''}`,
              isPrimary: sa.location_code === 'primary' || false,
              notes: sa.name || ''
            })) || [];

            return {
              id: customer.id,
              name: customer.name || "Unknown",
              email: primaryContact?.email || "",
              phone: primaryContact?.phone || "",
              address: addressStr,
              billAddress: customer.billing_address_line1 || "",
              billCity: customer.billing_city || "",
              serviceAddresses: serviceAddresses,
              type: (customer.status?.includes('commercial') ? 'commercial' : 'residential') as Customer["type"],
              status: (customer.status as Customer["status"]) || "active",
              createdAt: customer.created_at || new Date().toISOString(),
              lastService: ""  // No direct mapping for this field in our database yet
            };
          });
          return transformedData;
        }

        // If no data from Supabase, return empty array
        return [];
      } catch (error) {
        console.error("Error in fetching customers:", error);
        return [];
      }
    }
  });

  // Query for fetching a single customer with service addresses
  const { data: customerDetails, isLoading: isCustomerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ["customer", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;

      try {
        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', selectedCustomerId)
          .single();
          
        if (customerError) {
          throw new Error(`Error fetching customer: ${customerError.message}`);
        }
        
        // Fetch service addresses for this customer
        const { data: serviceAddressesData, error: addressesError } = await supabase
          .from('service_addresses')
          .select('*')
          .eq('customer_id', selectedCustomerId);
          
        if (addressesError) {
          throw new Error(`Error fetching service addresses: ${addressesError.message}`);
        }
        
        // Fetch primary contact info
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('*')
          .eq('customer_id', selectedCustomerId);
          
        let email = '';
        let phone = '';
        
        if (contactsData && contactsData.length > 0) {
          const primaryContact = contactsData.find(c => c.is_primary) || contactsData[0];
          email = primaryContact.email || '';
          phone = primaryContact.phone || '';
        }
        
        // Transform service addresses to match our app's format
        const serviceAddresses = serviceAddressesData.map(addr => ({
          id: addr.id,
          address: `${addr.address_line1 || ''} ${addr.address_line2 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim(),
          isPrimary: addr.location_code === 'primary' || false,
          notes: addr.name || ''
        }));
        
        // Create combined customer object
        return {
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
        } as Customer;
      } catch (error) {
        console.error("Error fetching customer details:", error);
        toast({
          title: "Error",
          description: `Could not load customer details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!selectedCustomerId
  });

  const filteredCustomers = customersData?.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.address?.toLowerCase().includes(query) ||
      customer.billCity?.toLowerCase().includes(query)
    );
  }) || [];

  const handleCustomerClick = (customerId: string) => {
    console.log("Customer clicked:", customerId);
    setSelectedCustomerId(customerId);
    
    // If we have customer details, update the selectedCustomer and open the dialog
    if (customerDetails?.id === customerId) {
      setSelectedCustomer(customerDetails);
      setDetailsDialogOpen(true);
    } else {
      // Otherwise, fetch the customer details
      setSelectedCustomerId(customerId);
      refetchCustomer().then(() => {
        if (customerDetails) {
          setSelectedCustomer(customerDetails);
          setDetailsDialogOpen(true);
        }
      });
    }
  };
  
  const handleCreateWorkOrder = (customer: Customer, serviceAddress?: string) => {
    console.log("Creating work order for", customer.name, "at address:", serviceAddress);
    toast({
      title: "Work Order",
      description: `Creating work order for ${customer.name}`,
    });
  };

  return (
    <MainLayout pageName="Customers">
      <div className="flex flex-col space-y-6">
        <CustomersHeader 
          onAddCustomer={() => setShowAddDialog(true)}
          onSyncComplete={() => refetch()}
        />

        <CustomersToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenFilters={() => setFilterDialogOpen(true)}
          onRefresh={() => refetch()}
        />

        <CustomersContent 
          isLoading={isLoading}
          customers={filteredCustomers}
          viewMode={viewMode}
          onCustomerClick={handleCustomerClick}
          onAddCustomer={() => setShowAddDialog(true)}
        />
      </div>

      {selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onCreateWorkOrder={handleCreateWorkOrder}
          permissions={{
            canViewCustomerPaymentHistory: true,
            canViewFuturePaymentPlans: true,
          }}
        />
      )}

      <AddCustomerDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onSuccess={() => {
          refetch();
          toast({
            title: "Customer Added",
            description: "Customer has been successfully added.",
          });
        }}
        onCustomerAdded={(newCustomer) => {
          console.log("New customer added:", newCustomer);
        }}
      />

      <CustomerFilterDialog 
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
      />
    </MainLayout>
  );
};

export default CustomersList;
