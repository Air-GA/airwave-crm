
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Building2, User, FileText } from "lucide-react";

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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ServiceAddress {
  id: string;
  address: string;
  customer_id: string;
  is_primary: boolean;
  notes: string | null;
  customer_name?: string;
  customer_type?: string;
}

const ServiceAddresses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch all service addresses with customer info
  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ["service-addresses"],
    queryFn: async () => {
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
        .select("id, name, type");

      if (customersError) {
        throw new Error(customersError.message);
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

      return enrichedAddresses as ServiceAddress[];
    },
  });

  // Handle search
  const filteredAddresses = addresses?.filter((addr) =>
    addr.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (addr.notes && addr.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <MainLayout pageName="Service Addresses">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Addresses</CardTitle>
            <CardDescription>
              All service locations for customers, including properties managed by landlords.
            </CardDescription>
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No service addresses found. Try adjusting your search criteria.
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

export default ServiceAddresses;
