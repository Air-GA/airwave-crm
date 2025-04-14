import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpDown, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Home,
  Filter,
  Plus,
  LayoutGrid,
  LayoutList,
  UserRound,
  FileEdit,
  RefreshCw
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SyncWithQuickBooks } from "@/components/SyncWithQuickBooks";
import { SyncThreeCustomersButton } from "@/components/SyncThreeCustomersButton";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Customer, ServiceAddress } from "@/types";
import { apiIntegrationService } from "@/services/apiIntegrationService";

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Johnson Family",
    email: "johnson@example.com",
    phone: "404-555-1234",
    address: "123 Maple Street, Atlanta, GA",
    billAddress: "123 Maple Street, Atlanta, GA",
    serviceAddresses: [
      { id: "addr-1", address: "123 Maple Street, Atlanta, GA", isPrimary: true }
    ],
    type: "residential",
    createdAt: new Date().toISOString(),
    lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: "3",
    name: "Sarah Wilson",
    email: "swilson@gmail.com",
    phone: "678-555-3456",
    address: "456 Oak Avenue, Marietta, GA",
    billAddress: "456 Oak Avenue, Marietta, GA",
    serviceAddresses: [
      { id: "addr-3", address: "456 Oak Avenue, Marietta, GA", isPrimary: true }
    ],
    type: "residential",
    createdAt: new Date().toISOString(),
    lastService: null
  }
];

const CustomersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { permissions, user, userRole } = useAuth();

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase.client
        .from("customers")
        .select("*")
        .eq("type", "residential")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        console.log("No residential customers found in database, using mock data");
        return mockCustomers.filter(customer => customer.type === "residential");
      }
      
      const formattedData = data.map(customer => {
        if (!customer.serviceAddresses) {
          const serviceAddresses: ServiceAddress[] = [];
          if (customer.service_address) {
            serviceAddresses.push({
              id: `legacy-${customer.id}`,
              address: customer.service_address,
              isPrimary: true
            });
          } else if (customer.address) {
            serviceAddresses.push({
              id: `legacy-${customer.id}`,
              address: customer.address,
              isPrimary: true
            });
          }
          
          return {
            ...customer,
            billAddress: customer.bill_address || customer.address || "",
            serviceAddresses 
          } as Customer;
        }
        return customer as Customer;
      });
      
      return formattedData;
    },
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const sortedCustomers = filteredCustomers?.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const syncCustomers = async () => {
    try {
      toast({
        title: "Syncing Customers",
        description: "Syncing customers...",
      });
      
      // Simulate sync with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await refetch();
      
      toast({
        title: "Sync Complete",
        description: "Successfully synced customers.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync customers.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };
  
  const handleAddCustomer = (newCustomer: Customer) => {
    refetch();
    toast({
      title: "Customer added",
      description: "The customer has been added successfully."
    });
  };
  
  const handleCreateWorkOrder = (customer: Customer, serviceAddress?: string) => {
    const addressToUse = serviceAddress || 
      (customer.serviceAddresses?.find(a => a.isPrimary)?.address || 
      customer.serviceAddresses?.[0]?.address || 
      customer.address || '');
  
    navigate(`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone || '')}&customerEmail=${encodeURIComponent(customer.email || '')}&customerAddress=${encodeURIComponent(addressToUse)}`);
  };
  
  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <MainLayout pageName="Customers">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Residential Customers</CardTitle>
              <CardDescription>
                Comprehensive list of all residential customers in the system.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!permissions.canViewOnlyAssociatedCustomers && userRole !== 'customer' && (
                <Button onClick={() => setShowAddCustomerDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
              )}
              <SyncThreeCustomersButton onSyncComplete={refetch} />
              <SyncWithQuickBooks entityType="customers" onSyncComplete={refetch} />
              <AddCustomerDialog 
                open={showAddCustomerDialog} 
                onOpenChange={setShowAddCustomerDialog} 
                onCustomerAdded={handleAddCustomer} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="flex items-center gap-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
                </Button>
                <div className="border rounded-md">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-r-none"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-l-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {isLoading && (
              viewMode === "list" ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Customer Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-[250px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-[200px] mb-2" />
                        <Skeleton className="h-4 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[180px] mb-2" />
                        <Skeleton className="h-20 w-full mb-2" />
                        <div className="flex gap-2 mt-4">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}
            
            {!isLoading && viewMode === "list" && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Customer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCustomers?.length ? (
                      sortedCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{customer.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.email ? (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.email}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {customer.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.phone}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {customer.address ? (
                              <div className="flex items-center gap-1">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.address}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewCustomerDetails(customer)}
                              >
                                View
                              </Button>
                              {(!permissions.canViewOnlyAssociatedCustomers || 
                                (user?.associatedIds?.includes(customer.id))) && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCreateWorkOrder(customer)}
                                >
                                  <FileEdit className="h-3.5 w-3.5 mr-1.5" />
                                  Work Order
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <UserRound className="h-8 w-8 text-muted-foreground" />
                            <p>No customers found.</p>
                            {!permissions.canViewOnlyAssociatedCustomers && userRole !== 'customer' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowAddCustomerDialog(true)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Customer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {!isLoading && viewMode === "grid" && (
              <>
                {sortedCustomers?.length ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedCustomers.map(customer => (
                      <CustomerCard 
                        key={customer.id} 
                        customer={customer} 
                        onCreateWorkOrder={(serviceAddress) => handleCreateWorkOrder(customer, serviceAddress)}
                        onViewDetails={() => handleViewCustomerDetails(customer)}
                      />
                    ))}
                  </div>
                ) : (
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
              </>
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
                          {selectedCustomer.serviceAddresses.map((addr) => (
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
                        <p>{selectedCustomer.address || 'No service address'}</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Billing Address</h4>
                      <p>{selectedCustomer.billAddress || selectedCustomer.address || 'No billing address'}</p>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CustomersList;
