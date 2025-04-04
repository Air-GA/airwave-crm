import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { customers as initialCustomers } from "@/data/mockData";
import { Customer as MockCustomer, ServiceAddress } from "@/data/mockData";
import { Customer } from "@/types";
import { getImportedCustomers } from "@/services/importService";
import { ChevronDown, FileEdit, Plus, Search, UserRound } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Customers = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { permissions, user, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  
  useEffect(() => {
    const importedCustomers = getImportedCustomers();
    console.log(`Loaded ${importedCustomers.length} imported customers`);
    
    const processedMockCustomers: Customer[] = initialCustomers.map(mockCustomer => {
      const customer: Customer = {
        ...mockCustomer,
        address: mockCustomer.address,
        serviceAddress: mockCustomer.serviceAddress,
        serviceAddresses: mockCustomer.serviceAddresses || [
          { 
            id: `legacy-${mockCustomer.id}`, 
            address: mockCustomer.serviceAddress || '', 
            isPrimary: true 
          }
        ]
      };
      return customer;
    });
    
    const allCustomers: Customer[] = [...processedMockCustomers, ...importedCustomers];
    console.log(`Total customers loaded: ${allCustomers.length}`);
    setCustomers(allCustomers);
  }, []);
  
  const [filteredCustomersByRole, setFilteredCustomersByRole] = useState<Customer[]>([]);
  
  useEffect(() => {
    let roleFilteredCustomers = [...customers];
    
    if (permissions.canViewOnlyAssociatedCustomers && user?.associatedIds) {
      roleFilteredCustomers = customers.filter(customer => 
        user.associatedIds?.includes(customer.id)
      );
    }
    else if (userRole === 'customer' && user?.associatedIds) {
      roleFilteredCustomers = customers.filter(customer =>
        user.associatedIds?.includes(customer.id)
      );
    }
    
    setFilteredCustomersByRole(roleFilteredCustomers);
  }, [customers, permissions, user, userRole]);
  
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prevCustomers => [newCustomer, ...prevCustomers]);
    toast.success("Customer added successfully!");
  };
  
  const handleCreateWorkOrder = (customer: Customer, serviceAddress?: string) => {
    const addressToUse = serviceAddress || 
      (customer.serviceAddresses?.find(a => a.isPrimary)?.address || 
      customer.serviceAddresses?.[0]?.address || 
      customer.serviceAddress || '');
  
    navigate(`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone)}&customerEmail=${encodeURIComponent(customer.email)}&customerAddress=${encodeURIComponent(addressToUse)}`);
  };
  
  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };
  
  const finalFilteredCustomers = filteredCustomersByRole.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) || 
      customer.serviceAddresses?.some(addr => addr.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
  
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
          {!permissions.canViewOnlyAssociatedCustomers && userRole !== 'customer' && (
            <Button onClick={() => setShowAddCustomerDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          )}
          <AddCustomerDialog 
            open={showAddCustomerDialog} 
            onOpenChange={setShowAddCustomerDialog} 
            onCustomerAdded={handleAddCustomer} 
          />
        </div>
        
        {userRole !== 'customer' && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 w-full md:max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              <span>{finalFilteredCustomers.length} customers</span>
            </div>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {finalFilteredCustomers.map(customer => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onCreateWorkOrder={(serviceAddress) => handleCreateWorkOrder(customer, serviceAddress)}
              onViewDetails={() => handleViewCustomerDetails(customer)}
            />
          ))}
        </div>
        
        {finalFilteredCustomers.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <UserRound className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">
              {userRole === 'sales' 
                ? 'No customers assigned to you' 
                : 'No customers found'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {userRole === 'sales' 
                ? 'You don\'t have any customers assigned to you yet.' 
                : 'Try adjusting your search, or add a new customer.'}
            </p>
            {!permissions.canViewOnlyAssociatedCustomers && userRole !== 'customer' && (
              <Button className="mt-4" onClick={() => setShowAddCustomerDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            )}
          </div>
        )}
        
        {selectedCustomer && (
          <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCustomer.name}</DialogTitle>
                <DialogDescription>
                  Customer details and information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                    <p>{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                    <p>{selectedCustomer.email}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Addresses</h4>
                  {selectedCustomer.serviceAddresses && selectedCustomer.serviceAddresses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.serviceAddresses.map((addr: ServiceAddress) => (
                        <div key={addr.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              {addr.isPrimary && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mb-1 inline-block">Primary</span>}
                              <p>{addr.address}</p>
                              {addr.notes && <p className="text-sm text-muted-foreground mt-1">{addr.notes}</p>}
                            </div>
                            {(!permissions.canViewOnlyAssociatedCustomers || 
                              (user?.associatedIds?.includes(selectedCustomer.id))) && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  handleCreateWorkOrder(selectedCustomer, addr.address);
                                  setShowCustomerDetails(false);
                                }}
                              >
                                <FileEdit className="h-4 w-4 mr-1" />
                                Work Order
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{selectedCustomer.serviceAddress || 'No service address'}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Billing Address</h4>
                  <p>{selectedCustomer.billAddress}</p>
                </div>
                
                {permissions.canViewCustomerPaymentHistory && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Payment History</h4>
                    <p className="text-sm text-muted-foreground">No payment history available.</p>
                  </div>
                )}
                
                {permissions.canViewFuturePaymentPlans && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Payment Plans</h4>
                    <p className="text-sm text-muted-foreground">No payment plans available.</p>
                  </div>
                )}
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setShowCustomerDetails(false)}>
                    Close
                  </Button>
                  {(!permissions.canViewOnlyAssociatedCustomers || 
                    (user?.associatedIds?.includes(selectedCustomer.id))) && (
                    <Button onClick={() => {
                      handleCreateWorkOrder(selectedCustomer);
                      setShowCustomerDetails(false);
                    }}>
                      <FileEdit className="mr-1.5 h-4 w-4" />
                      Create Work Order
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default Customers;
