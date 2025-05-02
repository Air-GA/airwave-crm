
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
import { toast } from "sonner";
import { SyncThreeCustomersButton } from "@/components/SyncThreeCustomersButton";

const CustomersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Get data from the customer store
  const { filteredCustomers, isLoading, setSearchFilter, selectedCustomerId, setSelectedCustomerId } = useCustomerStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  console.log("CustomersList rendering with", filteredCustomers.length, "filtered customers, isLoading:", isLoading);

  // Initialize on component mount - fetch actual Supabase data
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        console.log("Starting to fetch customers from Supabase...");
        
        toast("Loading Customers...");
        
        // Then fetch from API
        const customers = await fetchCustomers();
        
        console.log(`Fetched ${customers.length} customers from Supabase`);
        
        if (customers.length === 0) {
          toast.error("No customers found. Use the 'Sync 3 Sample Customers' button to add test data.");
        } else {
          toast.success(`Successfully loaded ${customers.length.toLocaleString()} customers`);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
        toast.error("Failed to load customers: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    };
    
    loadCustomers();
  }, []);
  
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
        toast.error("Failed to load customer details. Please try again.");
      }
    };
    
    loadCustomerDetails();
  }, [selectedCustomerId]);

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
    toast.success(`Creating work order for ${customer.name}`);
  };
  
  const handleRefresh = async () => {
    try {
      toast("Refreshing customer data...");
      
      await fetchCustomers();
      
      toast.success(`Loaded ${filteredCustomers.length.toLocaleString()} customers`);
    } catch (error) {
      console.error("Error refreshing customers:", error);
      toast.error("Failed to refresh customer data: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleSyncComplete = () => {
    console.log("Sync completed, refreshing customers list");
    handleRefresh();
  };

  return (
    <MainLayout pageName="Customers">
      <div className="flex flex-col space-y-6">
        <CustomersHeader 
          onAddCustomer={() => setShowAddDialog(true)} 
          onSyncComplete={handleSyncComplete}
        />

        <div className="flex justify-center mb-4">
          <SyncThreeCustomersButton onSyncComplete={handleSyncComplete} />
        </div>

        <CustomersToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenFilters={() => setFilterDialogOpen(true)}
          onRefresh={handleRefresh}
          customerCount={filteredCustomers.length}
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
