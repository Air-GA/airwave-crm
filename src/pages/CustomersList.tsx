
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { CustomerFilterDialog } from "@/components/customers/CustomerFilterDialog";
import { CustomersHeader } from "@/components/customers/CustomersHeader";
import { CustomersToolbar } from "@/components/customers/CustomersToolbar";
import { CustomersContent } from "@/components/customers/CustomersContent";
import { CustomerDetails } from "@/components/customers/CustomerDetails";
import { 
  useCustomerStore, 
  fetchCustomers, 
  getCustomerById 
} from "@/services/customerStore";

const CustomersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get data from the customer store
  const { filteredCustomers, isLoading, setSearchFilter, selectedCustomerId, setSelectedCustomerId } = useCustomerStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Initialize on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        await fetchCustomers();
      } catch (error) {
        console.error("Error loading customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadCustomers();
  }, [toast]);
  
  // When selectedCustomerId changes, load the customer details
  useEffect(() => {
    const loadCustomerDetails = async () => {
      if (!selectedCustomerId) {
        setSelectedCustomer(null);
        return;
      }
      
      try {
        const customer = await getCustomerById(selectedCustomerId);
        if (customer) {
          setSelectedCustomer(customer);
          setDetailsDialogOpen(true);
        }
      } catch (error) {
        console.error("Error loading customer details:", error);
        toast({
          title: "Error",
          description: "Failed to load customer details. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadCustomerDetails();
  }, [selectedCustomerId, toast]);

  // Sync search query with the store
  useEffect(() => {
    setSearchFilter(searchQuery);
  }, [searchQuery, setSearchFilter]);

  const handleCustomerClick = (customerId: string) => {
    console.log("Customer clicked:", customerId);
    setSelectedCustomerId(customerId);
  };
  
  const handleCreateWorkOrder = (customer: Customer, serviceAddress?: string) => {
    console.log("Creating work order for", customer.name, "at address:", serviceAddress);
    toast({
      title: "Work Order",
      description: `Creating work order for ${customer.name}`,
    });
  };
  
  const handleRefresh = async () => {
    try {
      await fetchCustomers();
      toast({
        title: "Refreshed",
        description: "Customer data has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing customers:", error);
      toast({
        title: "Error",
        description: "Failed to refresh customer data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout pageName="Customers">
      <div className="flex flex-col space-y-6">
        <CustomersHeader 
          onAddCustomer={() => setShowAddDialog(true)}
          onSyncComplete={handleRefresh}
        />

        <CustomersToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenFilters={() => setFilterDialogOpen(true)}
          onRefresh={handleRefresh}
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
        onSuccess={handleRefresh}
        onCustomerAdded={(newCustomer) => {
          console.log("New customer added:", newCustomer);
          handleRefresh();
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
