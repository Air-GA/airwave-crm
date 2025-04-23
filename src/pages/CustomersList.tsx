
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SyncThreeCustomersButton } from "@/components/SyncThreeCustomersButton";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";
import { staticCustomers } from "@/data/mockData";
import { CustomerCSVUpload } from "@/components/customers/CustomerCSVUpload";
import { CustomerSearch } from "@/components/customers/CustomerSearch";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomersViewToggle } from "@/components/customers/CustomersViewToggle";
import { CustomerListView } from "@/components/customers/CustomerListView";
import { CustomerGridView } from "@/components/customers/CustomerGridView";
import { CustomerFilterDialog } from "@/components/customers/CustomerFilterDialog";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";

const CustomersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*, service_addresses(*)");

        if (error) {
          console.error("Error fetching customers:", error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Fetched customers from Supabase:", data);
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
          return transformedData;
        }

        console.log("No customers in Supabase, using static data");
        return staticCustomers;
      } catch (error) {
        console.error("Error in fetching customers:", error);
        return staticCustomers;
      }
    }
  });

  const filteredCustomers = customersData?.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.address?.toLowerCase().includes(query)
    );
  }) || [];

  const handleAddCustomer = () => {
    setShowAddDialog(true);
  };

  const handleCustomerClick = (customerId: string) => {
    console.log("Customer clicked:", customerId);
    toast({
      title: "Customer Selected",
      description: `Customer ID: ${customerId}`,
    });
  };

  return (
    <MainLayout pageName="Customers">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <div className="flex space-x-2">
            <CustomerCSVUpload onUploadComplete={() => refetch()} />
            <Button variant="default" size="sm" onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
            <SyncThreeCustomersButton onSyncComplete={() => refetch()} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <CustomerSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <CustomerFilters onOpenFilters={() => setFilterDialogOpen(true)} />
            <CustomersViewToggle 
              viewMode={viewMode}
              setViewMode={setViewMode as (mode: "grid" | "list") => void}
            />
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
            <div className="flex flex-col items-center justify-center h-40 space-y-2">
              <p className="text-center text-muted-foreground">No customers found.</p>
              <Button onClick={handleAddCustomer} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Customer
              </Button>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          <CustomerGridView 
            customers={filteredCustomers}
            onCustomerClick={handleCustomerClick}
          />
        ) : (
          <CustomerListView 
            customers={filteredCustomers}
            onCustomerClick={handleCustomerClick}
          />
        )}
      </div>

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
        onCustomerAdded={(newCustomer) => {
          console.log("New customer added:", newCustomer);
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
