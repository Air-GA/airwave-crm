
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpDown, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Home,
  Building2 
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
import { SyncButton } from "@/components/SyncButton";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: string;
  created_at: string;
  last_service: string | null;
}

// Mock customer data to use when no data is found in the database
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Johnson Family",
    email: "johnson@example.com",
    phone: "404-555-1234",
    address: "123 Maple Street, Atlanta, GA",
    type: "residential",
    created_at: new Date().toISOString(),
    last_service: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: "2",
    name: "Atlanta Office Towers",
    email: "property@atlantaoffice.com",
    phone: "404-555-5678",
    address: "1000 Peachtree St, Atlanta, GA",
    type: "commercial",
    created_at: new Date().toISOString(),
    last_service: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  },
  {
    id: "3",
    name: "Sarah Wilson",
    email: "swilson@gmail.com",
    phone: "678-555-3456",
    address: "456 Oak Avenue, Marietta, GA",
    type: "residential",
    created_at: new Date().toISOString(),
    last_service: null
  },
  {
    id: "4",
    name: "Peachtree Mall",
    email: "facilities@peachtreemall.com",
    phone: "770-555-7890",
    address: "2500 Commercial Blvd, Atlanta, GA",
    type: "commercial",
    created_at: new Date().toISOString(),
    last_service: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
  },
  {
    id: "5",
    name: "Thompson Properties",
    email: "info@thompsonproperties.com",
    phone: "404-555-9012",
    address: "789 Landlord Lane, Atlanta, GA",
    type: "commercial",
    created_at: new Date().toISOString(),
    last_service: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  }
];

const CustomersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  // Fetch all customers
  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase.client
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      
      // If no data is found in the database, use mock data
      if (!data || data.length === 0) {
        console.log("No customers found in database, using mock data");
        return mockCustomers;
      }
      
      return data as Customer[];
    },
  });

  // Handle search
  const filteredCustomers = customers?.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  // Sort customers based on name and current sort order
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

  // Sync customers from external system
  const syncCustomers = async () => {
    try {
      // In a real app, this would connect to QuickBooks, CRM, etc.
      // For now, we'll just refetch from our database
      await refetch();
      return Promise.resolve();
    } catch (error) {
      console.error("Error syncing customers:", error);
      return Promise.reject(error);
    }
  };

  // Display error if query fails
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
    <MainLayout pageName="Customers List">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>
                Comprehensive alphabetical list of all customers in the system.
              </CardDescription>
            </div>
            <SyncButton onSync={syncCustomers} label="Customers" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="flex items-center gap-1"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Customer Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedCustomers?.length ? (
                    sortedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {customer.type === 'commercial' ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.type === 'commercial' ? "secondary" : "default"} className="capitalize">
                            {customer.type}
                          </Badge>
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No customers found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CustomersList;
