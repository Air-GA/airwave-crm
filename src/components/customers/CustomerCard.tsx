
import { useState } from "react";
import { UserRound, Phone, Building, MapPin, MoreHorizontal, FileEdit, DollarSign, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer, ServiceAddress } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

interface CustomerCardProps {
  customer: Customer;
  onCreateWorkOrder: (serviceAddress?: string) => void;
  onViewDetails: () => void;
}

export function CustomerCard({ customer, onCreateWorkOrder, onViewDetails }: CustomerCardProps) {
  const isMobile = useIsMobile();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { permissions, user } = useAuth();
  
  // Check if the logged-in user can view this customer
  // For sales users, they should only see customers they sold to
  const canViewCustomer = () => {
    if (permissions.canViewOnlyAssociatedCustomers && user?.associatedIds) {
      return user.associatedIds.includes(customer.id);
    }
    return true;
  };
  
  // If user can't view this customer, don't render the card
  if (permissions.canViewOnlyAssociatedCustomers && !canViewCustomer()) {
    return null;
  }
  
  // Get primary address or first address
  const primaryAddress = customer.serviceAddresses?.find(a => a.isPrimary)?.address || 
    (customer.serviceAddresses?.length > 0 ? customer.serviceAddresses[0].address : customer.serviceAddress || '');
  
  // Prepare addresses - use serviceAddresses if available, otherwise create one from the legacy serviceAddress
  const addresses = customer.serviceAddresses?.length 
    ? customer.serviceAddresses 
    : [{ id: 'legacy', address: customer.serviceAddress || '', isPrimary: true }];
  
  // Handle creating work order with specific address
  const handleCreateWorkOrder = (address?: string) => {
    onCreateWorkOrder(address || primaryAddress);
  };

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
              {!permissions.canViewOnlyAssociatedCustomers && (
                <DropdownMenuItem onClick={() => handleCreateWorkOrder()}>Create Work Order</DropdownMenuItem>
              )}
              {permissions.canViewCustomerPaymentHistory && (
                <DropdownMenuItem>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment History
                </DropdownMenuItem>
              )}
              {permissions.canViewFuturePaymentPlans && (
                <DropdownMenuItem>
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Payment Schedule
                </DropdownMenuItem>
              )}
              {!permissions.canViewOnlyOwnWorkOrders && (
                <DropdownMenuItem>View Service History</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          <p className="text-muted-foreground">
            {customer.email}
          </p>
          
          {addresses.length > 1 ? (
            <div className="space-y-2 mt-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium text-sm">Service Addresses</span>
                <span className="ml-2 text-xs text-muted-foreground">({addresses.length})</span>
              </div>
              
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-2 bg-slate-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm flex items-center gap-1">
                          {addr.isPrimary && <Badge variant="outline" className="text-xs">Primary</Badge>}
                        </div>
                        <p className="text-sm mt-1">{addr.address}</p>
                      </div>
                      {(!permissions.canViewOnlyAssociatedCustomers || canViewCustomer()) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7"
                          onClick={() => handleCreateWorkOrder(addr.address)}
                        >
                          <FileEdit className="h-3.5 w-3.5 mr-1" />
                          {isMobile ? "Order" : "Work Order"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="service">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="service">Service Address</TabsTrigger>
                <TabsTrigger value="billing">Billing Address</TabsTrigger>
              </TabsList>
              <TabsContent value="service" className="pt-2">
                <p className="text-sm">{primaryAddress}</p>
              </TabsContent>
              <TabsContent value="billing" className="pt-2">
                <p className="text-sm">{customer.billAddress}</p>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex gap-2 pt-2">
            {(!permissions.canViewOnlyAssociatedCustomers || canViewCustomer()) && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCreateWorkOrder()}>
                <FileEdit className="mr-1.5 h-4 w-4" />
                {isMobile ? "Work Order" : "New Work Order"}
              </Button>
            )}
            <Button size="sm" className="flex-1" onClick={onViewDetails}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
