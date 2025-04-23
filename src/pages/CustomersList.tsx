
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
import { customers } from "@/data/mockData";
import { getStaticCustomers } from "@/services/customerSyncService";

const staticCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '404-555-1234',
    address: '123 Main St, Atlanta, GA 30301',
    billAddress: '123 Main St, Atlanta, GA 30301',
    serviceAddresses: [
      {
        id: 'addr-1',
        address: '123 Main St, Atlanta, GA 30301',
        isPrimary: true,
        notes: 'Primary residence'
      }
    ],
    type: 'residential',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastService: new Date().toISOString()
  },
  {
    id: 'c3',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '404-555-3456',
    address: '456 Oak Dr, Marietta, GA 30060',
    billAddress: '456 Oak Dr, Marietta, GA 30060',
    serviceAddresses: [
      {
        id: 'addr-4',
        address: '456 Oak Dr, Marietta, GA 30060',
        isPrimary: true,
        notes: 'Home address'
      }
    ],
    type: 'residential',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastService: new Date().toISOString()
  },
  {
    id: 'c5',
    name: 'Thomas Family',
    email: 'thomasfamily@outlook.com',
    phone: '770-555-7890',
    address: '789 Pine Road, Alpharetta, GA',
    billAddress: '789 Pine Road, Alpharetta, GA',
    serviceAddresses: [
      {
        id: 'addr-5',
        address: '789 Pine Road, Alpharetta, GA',
        isPrimary: true,
        notes: 'Beware of dog'
      }
    ],
    type: 'residential',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastService: new Date().toISOString()
  }
];

// CustomersList component
const CustomersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch customers data
  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      setLoading(true);
      try {
        // Attempt to fetch from Supabase
        const { data, error } = await supabase
          .from("customers")
          .select("*, service_addresses(*)");

        if (error) {
          console.error("Error fetching customers:", error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Fetched customers from Supabase:", data);
          // Transform Supabase data to match our Customer type
          const transformedData: Customer[] = data.map(customer => ({
            id: customer.id,
            name: customer.name || "Unknown",
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            billAddress: customer.bill_address || customer.address || "",
            serviceAddresses: customer.service_addresses?.map((sa: any) => ({
              id: sa.id,
              address: sa.address,
              isPrimary: sa.is_primary,
              notes: sa.notes
            })) || [],
            type: (customer.type as Customer["type"]) || "residential",
            status: (customer.status as Customer["status"]) || "active",
            createdAt: customer.created_at || new Date().toISOString(),
            lastService: customer.last_service || undefined
          }));
          setLoading(false);
          return transformedData;
        }

        // Fallback to mock data if no Supabase data
        console.log("No customers in Supabase, using static data");
        return staticCustomers;
      } catch (error) {
        console.error("Error in fetching customers:", error);
        // Use static data as fallback
        return staticCustomers;
      } finally {
        setLoading(false);
      }
    }
  });

  // Filter customers based on search query
  const filteredCustomers = customersData?.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.address?.toLowerCase().includes(query)
    );
  }) || [];

  // Handle add new customer
  const handleAddCustomer = () => {
    setShowAddDialog(true);
  };

  // Handle customer click for details view
  const handleCustomerClick = (customerId: string) => {
    console.log("Customer clicked:", customerId);
    toast({
      title: "Customer Selected",
      description: `Customer ID: ${customerId}`,
    });
    // Future navigation to customer details page
  };

  return (
    <MainLayout pageName="Customers">
      <div className="flex flex-col space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <div className="flex space-x-2">
            <Button variant="default" size="sm" onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
            <SyncWithQuickBooks />
            <SyncThreeCustomersButton onSuccess={() => refetch()} />
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <div className="border rounded-md flex">
              <Button
                variant={viewMode === "grid" ? "ghost" : "ghost"}
                size="icon"
                className={`rounded-r-none ${viewMode === "grid" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "ghost" : "ghost"}
                size="icon"
                className={`rounded-l-none ${viewMode === "list" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Customer listing */}
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="h-40 w-full rounded-lg mb-2" />
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40 space-y-2">
              <p className="text-center text-muted-foreground">No customers found.</p>
              <Button onClick={handleAddCustomer} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Customer
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => handleCustomerClick(customer.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id} 
                    onClick={() => handleCustomerClick(customer.id)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserRound className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Home className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {customer.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={customer.status === "active" ? "default" : 
                                customer.status === "inactive" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Add Customer Dialog */}
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
      />

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Customers</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down your customer list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Customer Type</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">Residential</Button>
                <Button variant="outline" size="sm" className="flex-1">Commercial</Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Status</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">Active</Button>
                <Button variant="outline" size="sm" className="flex-1">Inactive</Button>
                <Button variant="outline" size="sm" className="flex-1">Pending</Button>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
              Reset
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CustomersList;
