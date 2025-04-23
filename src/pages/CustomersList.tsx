import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";
import { staticCustomers } from "@/data/mockData";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { CustomerFilterDialog } from "@/components/customers/CustomerFilterDialog";
import { CustomersHeader } from "@/components/customers/CustomersHeader";
import { CustomersToolbar } from "@/components/customers/CustomersToolbar";
import { CustomersContent } from "@/components/customers/CustomersContent";

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
        <CustomersHeader 
          onAddCustomer={() => setShowAddDialog(true)}
          onSyncComplete={() => refetch()}
        />

        <CustomersToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenFilters={() => setFilterDialogOpen(true)}
          onRefresh={() => refetch()}
        />

        <CustomersContent 
          isLoading={isLoading}
          customers={filteredCustomers}
          viewMode={viewMode}
          onCustomerClick={handleCustomerClick}
          onAddCustomer={() => setShowAddDialog(true)}
        />
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
