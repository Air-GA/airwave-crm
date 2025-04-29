
import { Customer, ServiceAddress } from "@/types";
import { Button } from "@/components/ui/button";
import { FileEdit, Mail, Phone, Home, MapPin, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CustomerDetailsProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkOrder: (customer: Customer, serviceAddress?: string) => void;
  permissions: {
    canViewCustomerPaymentHistory?: boolean;
    canViewFuturePaymentPlans?: boolean;
    canViewOnlyAssociatedCustomers?: boolean;
  };
  user?: {
    associatedIds?: string[];
  };
}

export const CustomerDetails = ({
  customer,
  open,
  onOpenChange,
  onCreateWorkOrder,
  permissions,
  user,
}: CustomerDetailsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{customer.name}</DialogTitle>
              <DialogDescription>
                Customer details and information
              </DialogDescription>
            </div>
            <Badge 
              variant={customer.status === "active" ? "default" : 
                     customer.status === "inactive" ? "secondary" : "outline"}
              className="capitalize"
            >
              {customer.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start">
              <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium">Phone</h4>
                <p>{customer.phone || "No phone available"}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium">Email</h4>
                <p>{customer.email || "No email available"}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-start">
              <Home className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium">Service Addresses</h4>
                {customer.serviceAddresses && customer.serviceAddresses.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {customer.serviceAddresses.map((addr: ServiceAddress) => (
                      <div key={addr.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            {addr.isPrimary && <Badge variant="outline" className="mb-1">Primary</Badge>}
                            <p>{addr.address}</p>
                            {addr.notes && <p className="text-sm text-muted-foreground mt-1">{addr.notes}</p>}
                          </div>
                          {/* Only show work order button if appropriate for the role */}
                          {(!permissions.canViewOnlyAssociatedCustomers || 
                            (user?.associatedIds?.includes(customer.id))) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                onCreateWorkOrder(customer, addr.address);
                                onOpenChange(false);
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
                  <p className="italic text-muted-foreground">{customer.serviceAddress || 'No service address'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium">Billing Address</h4>
                <p>{customer.billAddress || 'No billing address'}</p>
                {customer.billCity && (
                  <p className="text-sm text-muted-foreground">
                    {customer.billCity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {customer.lastService && (
            <div className="border-t pt-3">
              <div className="flex items-start">
                <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <h4 className="text-sm font-medium">Last Service</h4>
                  <p>{new Date(customer.lastService).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Show financial information based on permissions */}
          {permissions.canViewCustomerPaymentHistory && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium">Payment History</h4>
              <p className="text-sm text-muted-foreground">No payment history available.</p>
            </div>
          )}

          {permissions.canViewFuturePaymentPlans && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium">Payment Plans</h4>
              <p className="text-sm text-muted-foreground">No payment plans available.</p>
            </div>
          )}

          <div className="pt-4 flex justify-between border-t mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {(!permissions.canViewOnlyAssociatedCustomers || 
              (user?.associatedIds?.includes(customer.id))) && (
              <Button onClick={() => {
                onCreateWorkOrder(customer);
                onOpenChange(false);
              }}>
                <FileEdit className="mr-1.5 h-4 w-4" />
                Create Work Order
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
