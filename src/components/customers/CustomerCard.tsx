
import React from "react";
import { UserRound, Mail, Phone, Home, Building2, MapPin, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types";

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  onViewDetails: () => void;
  onCreateWorkOrder?: (serviceAddress?: string) => void;
  isLoading?: boolean;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer, 
  onClick, 
  onViewDetails, 
  onCreateWorkOrder,
  isLoading = false 
}) => {
  const primaryAddress = customer.serviceAddresses?.find(addr => addr.isPrimary) || 
                        (customer.serviceAddresses && customer.serviceAddresses[0]) || 
                        { address: customer.address || "No address available" };
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6 pb-2">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              {customer.type === "commercial" ? (
                <Building2 className="h-5 w-5 text-primary" />
              ) : (
                <UserRound className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <Badge 
                variant={customer.status === "active" ? "default" : 
                        customer.status === "inactive" ? "secondary" : "outline"}
                className="mt-1 capitalize"
              >
                {customer.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {customer.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          
          {customer.phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {primaryAddress && (
            <div className="flex items-start text-muted-foreground">
              <Home className="h-4 w-4 mr-2 mt-1" />
              <span className="truncate">{primaryAddress.address}</span>
            </div>
          )}

          {customer.billCity && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{customer.billCity}</span>
            </div>
          )}

          {customer.lastService && (
            <div className="flex items-center text-muted-foreground pt-2 border-t mt-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-xs">Last service: {new Date(customer.lastService).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-3 border-t bg-muted/30 flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            "View Details"
          )}
        </Button>

        {onCreateWorkOrder && (
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            onCreateWorkOrder();
          }}>
            Work Order
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
