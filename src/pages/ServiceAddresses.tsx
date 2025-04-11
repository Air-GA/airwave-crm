
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Building2, User, FileText, Plus, MapPinOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Customer, ServiceAddress } from "@/types";
import { apiIntegrationService } from "@/services/apiIntegrationService";

interface ServiceAddressWithCustomer {
  id: string;
  address: string;
  customer_id: string;
  is_primary: boolean;
  notes: string | null;
  customer_name?: string;
  customer_type?: string;
}

// Mock service addresses data
const mockServiceAddresses: ServiceAddressWithCustomer[] = [
  {
    id: "addr-1",
    address: "123 Maple Street, Atlanta, GA",
    customer_id: "1",
    is_primary: true,
    notes: "Front door code: 1234",
    customer_name: "Johnson Family",
    customer_type: "residential"
  },
  {
    id: "addr-2",
    address: "456 Oak Avenue, Marietta, GA",
    customer_id: "3",
    is_primary: true,
    notes: null,
    customer_name: "Sarah Wilson",
    customer_type: "residential"
  },
  {
    id: "addr-3",
    address: "789 Pine Road, Alpharetta, GA",
    customer_id: "5",
    is_primary: true,
    notes: "Beware of dog",
    customer_name: "Thomas Family",
    customer_type: "residential"
  },
  {
    id: "addr-4",
    address: "321 Elm Street, Duluth, GA",
    customer_id: "6",
    is_primary: false,
    notes: "Rental property",
    customer_name: "Johnson Family",
    customer_type: "residential"
  },
  {
    id: "addr-5",
    address: "555 Magnolia Court, Roswell, GA",
    customer_id: "7",
    is_primary: true,
    notes: "Gate code: 9876",
    customer_name: "Rodriguez Family",
    customer_type: "residential"
  }
];

const ServiceAddresses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch all service addresses with customer info
  const { data: addresses, isLoading, error, refetch } = useQuery({
    queryKey: ["service-addresses"],
    queryFn: async () => {
      try {
        // First get all service addresses
        const { data: addressesData, error: addressesError } = await supabase.client
          .from("service_addresses")
          .select("*")
          .order("address");

        if (addressesError) {
          throw new Error(addressesError.message);
        }

        // Then get all customers to join with addresses
        const { data: customersData, error: customersError } = await supabase.client
          .from("customers")
          .select("id, name, type")
          .eq("type", "residential");

        if (customersError) {
          throw new Error(customersError.message);
        }

        // If no data is returned from the database, use mock data
        if (!addressesData || addressesData.length === 0) {
          console.log("No service addresses found in database, using mock data");
          return mockServiceAddresses;
        }

        // Join the data manually
        const enrichedAddresses = addressesData.map((address) => {
          const customer = customersData.find((c) => c.id === address.customer_id);
          return {
            ...address,
            customer_name: customer?.name || "Unknown Customer",
            customer_type: customer?.type || "unknown",
          };
        });

        return enrichedAddresses as ServiceAddressWithCustomer[];
      } catch (error) {
        console.error("Error fetching addresses:", error);
        // Return mock data if there's an error
        return mockServiceAddresses;
      }
    },
  });

  // Fetch customers for the add address dialog
  const { data: customers } = useQuery({
    queryKey: ["residential-customers"],
    queryFn: async () => {
      const { data, error } = await supabase.client
        .from("customers")
        .select("*")
        .eq("type", "residential")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
  });

  const syncAddressesWithQuickBooks = async () => {
    try {
      toast({
        title: "Syncing Service Addresses",
        description: "Syncing service addresses from QuickBooks...",
      });
      
      await apiIntegrationService.quickbooks.syncServiceAddresses();
      
      await refetch();
      
      toast({
        title: "Sync Complete",
        description: "Successfully synced service addresses from QuickBooks.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error syncing service addresses:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync service addresses from QuickBooks.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  // Handle search
  const filteredAddresses = addresses?.filter((addr) =>
    addr.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (addr.notes && addr.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle creating a work order for this address
  const handleCreateWorkOrder = (address: ServiceAddressWithCustomer) => {
    navigate(`/work-orders/create?customerId=${address.customer_id}&customerName=${encodeURIComponent(address.customer_name || '')}&customerAddress=${encodeURIComponent(address.address)}`);
  };

  // Display error if query fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching service addresses",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Form for adding new service address
  const AddServiceAddressForm = () => {
    const form = useForm({
      defaultValues: {
        customerId: selectedCustomerId || "",
        address: "",
        isPrimary: false,
        notes: "",
      },
    });

    const onSubmit = async (data: any) => {
      try {
        const { error } = await supabase.client.from("service_addresses").insert({
          customer_id: data.customerId,
          address: data.address,
          is_primary: data.isPrimary,
          notes: data.notes || null,
        });

        if (error) throw error;

        toast({
          title: "Service address added",
          description: "The service address has been added successfully.",
        });

        setShowAddAddressDialog(false);
        refetch();
      } catch (error: any) {
        toast({
          title: "Error adding service address",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers?.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPrimary"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Primary Address</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Set as the primary service address for this customer
                  </p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter any notes about this address (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddAddressDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Service Address</Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <MainLayout pageName="Service Addresses">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service Addresses</CardTitle>
              <CardDescription>
                All service locations for customers, including properties managed by landlords.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddAddressDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Address
              </Button>
              <SyncWithQuickBooks entityType="addresses" onSyncComplete={refetch} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search addresses or customers..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Address</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[250px]">Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredAddresses?.length ? (
                    filteredAddresses.map((address) => (
                      <TableRow key={address.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{address.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{address.customer_name}</span>
                            </div>
                            <Badge variant="outline" className="mt-1 w-fit">
                              {address.customer_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {address.is_primary ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Primary</Badge>
                          ) : (
                            <Badge variant="outline">Secondary</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {address.notes || <span className="text-muted-foreground text-sm">No notes</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateWorkOrder(address)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Work Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <MapPinOff className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-lg font-medium">No service addresses found</p>
                          <p className="text-muted-foreground mb-4">Try adjusting your search or add a new service address</p>
                          <Button onClick={() => setShowAddAddressDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Address
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Address Dialog */}
      <Dialog open={showAddAddressDialog} onOpenChange={setShowAddAddressDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Service Address</DialogTitle>
            <DialogDescription>
              Add a new service address for a residential customer.
            </DialogDescription>
          </DialogHeader>
          <AddServiceAddressForm />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ServiceAddresses;
