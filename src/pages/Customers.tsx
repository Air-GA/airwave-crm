import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, customers as initialCustomers } from "@/data/mockData";
import { ChevronDown, FileEdit, MoreHorizontal, Phone, Plus, Search, UserRound } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { toast } from "sonner";

const Customers = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  
  // Add a new customer to the list
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prevCustomers => [newCustomer, ...prevCustomers]);
    toast.success("Customer added successfully!");
  };
  
  // Handle creating a new work order for a customer
  const handleCreateWorkOrder = (customer: Customer) => {
    navigate(`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone)}&customerEmail=${encodeURIComponent(customer.email)}&customerAddress=${encodeURIComponent(customer.serviceAddress)}`);
  };
  
  // Handle viewing customer details
  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    return matchesSearch;
  });
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your residential customers</p>
          </div>
          <Button onClick={() => setShowAddCustomerDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
          <AddCustomerDialog 
            open={showAddCustomerDialog} 
            onOpenChange={setShowAddCustomerDialog} 
            onCustomerAdded={handleAddCustomer} 
          />
        </div>
        
        {/* Search */}
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
            <span>{filteredCustomers.length} customers</span>
          </div>
        </div>
        
        {/* Customer list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map(customer => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onCreateWorkOrder={() => handleCreateWorkOrder(customer)}
              onViewDetails={() => handleViewCustomerDetails(customer)}
            />
          ))}
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <UserRound className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No customers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search, or add a new customer.
            </p>
            <Button className="mt-4" onClick={() => setShowAddCustomerDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        )}
        
        {/* Customer details dialog */}
        {selectedCustomer && (
          <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
            <DialogContent className="sm:max-w-[600px]">
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
                  <h4 className="text-sm font-medium text-muted-foreground">Service Address</h4>
                  <p>{selectedCustomer.serviceAddress}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Billing Address</h4>
                  <p>{selectedCustomer.billAddress}</p>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setShowCustomerDetails(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    handleCreateWorkOrder(selectedCustomer);
                    setShowCustomerDetails(false);
                  }}>
                    <FileEdit className="mr-1.5 h-4 w-4" />
                    Create Work Order
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

interface CustomerCardProps {
  customer: Customer;
  onCreateWorkOrder: () => void;
  onViewDetails: () => void;
}

const CustomerCard = ({ customer, onCreateWorkOrder, onViewDetails }: CustomerCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full p-1.5 bg-blue-100 text-blue-600">
              <UserRound className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-medium">{customer.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateWorkOrder}>Create Work Order</DropdownMenuItem>
              <DropdownMenuItem>View Service History</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          <p className="text-muted-foreground">
            {customer.email}
          </p>
          <Tabs defaultValue="service">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="service">Service Address</TabsTrigger>
              <TabsTrigger value="billing">Billing Address</TabsTrigger>
            </TabsList>
            <TabsContent value="service" className="pt-2">
              <p className="text-sm">{customer.serviceAddress}</p>
            </TabsContent>
            <TabsContent value="billing" className="pt-2">
              <p className="text-sm">{customer.billAddress}</p>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onCreateWorkOrder}>
              <FileEdit className="mr-1.5 h-4 w-4" />
              {isMobile ? "Work Order" : "New Work Order"}
            </Button>
            <Button size="sm" className="flex-1" onClick={onViewDetails}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Customers;
