import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Customer } from "@/types";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CustomersFilterBar } from "@/components/customers/CustomersFilterBar";
import { CustomersGrid } from "@/components/customers/CustomersGrid";
import { CustomerDetails } from "@/components/customers/CustomerDetails";
import { CustomerEmptyState } from "@/components/customers/CustomerEmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerStore } from "@/services/customerStore";

const Customers = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { permissions, user, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  
  // Use the customer store instead of local state
  const { filteredCustomers, isLoading, setSearchFilter, fetchCustomers: refreshCustomers } = useCustomerStore();
  
  // Fetch customers on component mount
  useEffect(() => {
    refreshCustomers();
  }, []);
  
  // Filter customers based on user role and permissions
  const [filteredCustomersByRole, setFilteredCustomersByRole] = useState<Customer[]>([]);
  
  useEffect(() => {
    // Filter customers based on user role and permissions
    let roleFilteredCustomers = [...filteredCustomers];
    
    // For sales, only show customers they are associated with
    if (permissions?.canViewOnlyAssociatedCustomers && user?.associatedIds) {
      roleFilteredCustomers = filteredCustomers.filter(customer => 
        user.associatedIds?.includes(customer.id)
      );
    }
    // For customer role, only show themselves
    else if (userRole === 'customer' && user?.associatedIds) {
      roleFilteredCustomers = filteredCustomers.filter(customer =>
        user.associatedIds?.includes(customer.id)
      );
    }
    
    setFilteredCustomersByRole(roleFilteredCustomers);
  }, [filteredCustomers, permissions, user, userRole]);
  
  // Add a new customer to the list
  const handleAddCustomer = (newCustomer: Customer) => {
    // Refresh data after adding a customer
    refreshCustomers();
    toast.success("Customer added successfully!");
  };
  
  // Handle creating a new work order for a customer
  const handleCreateWorkOrder = (customer: Customer, serviceAddress?: string) => {
    // Use the provided service address or get the primary one
    const addressToUse = serviceAddress || 
      (customer.serviceAddresses?.find(a => a.isPrimary)?.address || 
      customer.serviceAddresses?.[0]?.address || 
      customer.address || '');
  
    navigate(`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone || '')}&customerEmail=${encodeURIComponent(customer.email || '')}&customerAddress=${encodeURIComponent(addressToUse)}`);
  };
  
  // Handle viewing customer details
  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };
  
  // Sync search between local state and store
  useEffect(() => {
    setSearchFilter(searchQuery);
  }, [searchQuery, setSearchFilter]);
  
  // Check if user can add customers
  const canAddCustomer = !permissions?.canViewOnlyAssociatedCustomers && userRole !== 'customer';
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              {userRole === 'sales' 
                ? 'Manage your assigned customers' 
                : userRole === 'customer'
                ? 'Your Customer Information' 
                : 'Manage your residential customers'}
            </p>
          </div>
          {canAddCustomer && (
            <Button onClick={() => setShowAddCustomerDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          )}
        </div>
        
        {/* Search and filters */}
        <CustomersFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          customersCount={filteredCustomersByRole.length}
          onAddCustomer={() => setShowAddCustomerDialog(true)}
          canAddCustomer={canAddCustomer}
          userRole={userRole}
        />
        
        {/* Customer list */}
        {filteredCustomersByRole.length > 0 ? (
          <CustomersGrid
            customers={filteredCustomersByRole}
            onCustomerClick={handleViewCustomerDetails}
            onViewDetails={handleViewCustomerDetails}
            onCreateWorkOrder={handleCreateWorkOrder}
            isLoading={isLoading}
          />
        ) : (
          <CustomerEmptyState 
            userRole={userRole}
            onAddCustomer={() => setShowAddCustomerDialog(true)}
            canAddCustomer={canAddCustomer}
          />
        )}
        
        {/* Customer details dialog */}
        {selectedCustomer && (
          <CustomerDetails
            customer={selectedCustomer}
            open={showCustomerDetails}
            onOpenChange={setShowCustomerDetails}
            onCreateWorkOrder={handleCreateWorkOrder}
            permissions={permissions}
            user={user}
          />
        )}
        
        {/* Add customer dialog */}
        <AddCustomerDialog 
          open={showAddCustomerDialog} 
          onOpenChange={setShowAddCustomerDialog} 
          onCustomerAdded={handleAddCustomer} 
        />
      </div>
    </MainLayout>
  );
};

export default Customers;
