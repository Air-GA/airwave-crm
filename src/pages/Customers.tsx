
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

const Customers = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { permissions, user, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  
  // Replace the store with direct Supabase data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to fetch customers from Supabase
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, 
          name, 
          status, 
          billing_city, 
          billing_address_line1, 
          billing_state,
          billing_zip,
          created_at,
          updated_at
        `);
      
      if (error) {
        throw new Error(`Error fetching customers: ${error.message}`);
      }
      
      // Transform the data to match our Customer type
      const transformedCustomers: Customer[] = data.map(item => ({
        id: item.id,
        name: item.name,
        address: item.billing_address_line1 || '',
        billAddress: item.billing_address_line1 || '',
        billCity: item.billing_city || '',
        status: (item.status as Customer["status"]) || "active",
        type: "residential", // Default to residential as we don't have this info yet
        createdAt: item.created_at,
        // Additional default values to satisfy Customer type
        serviceAddresses: []
      }));
      
      console.log("Fetched customers:", transformedCustomers);
      setCustomers(transformedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Filter customers based on user role and permissions
  const [filteredCustomersByRole, setFilteredCustomersByRole] = useState<Customer[]>([]);
  
  useEffect(() => {
    // Filter customers based on user role and permissions
    let roleFilteredCustomers = [...customers];
    
    // For sales, only show customers they are associated with
    if (permissions?.canViewOnlyAssociatedCustomers && user?.associatedIds) {
      roleFilteredCustomers = customers.filter(customer => 
        user.associatedIds?.includes(customer.id)
      );
    }
    // For customer role, only show themselves
    else if (userRole === 'customer' && user?.associatedIds) {
      roleFilteredCustomers = customers.filter(customer =>
        user.associatedIds?.includes(customer.id)
      );
    }
    
    setFilteredCustomersByRole(roleFilteredCustomers);
  }, [customers, permissions, user, userRole]);
  
  // Add a new customer to the list
  const handleAddCustomer = (newCustomer: Customer) => {
    // Refresh data after adding a customer
    fetchCustomers();
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
  
  // Filter customers based on search query
  const finalFilteredCustomers = filteredCustomersByRole.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) || 
      customer.serviceAddresses?.some(addr => addr.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
  
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
          customersCount={finalFilteredCustomers.length}
          onAddCustomer={() => setShowAddCustomerDialog(true)}
          canAddCustomer={canAddCustomer}
          userRole={userRole}
        />
        
        {/* Customer list */}
        {finalFilteredCustomers.length > 0 ? (
          <CustomersGrid
            customers={finalFilteredCustomers}
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
