
import { Customer, ServiceAddress } from "@/types";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
          <DialogTitle className="text-xl">{customer.name}</DialogTitle>
          <DialogDescription>
            Customer details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
              <p>{customer.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p>{customer.email}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Addresses</h4>
            {customer.serviceAddresses && customer.serviceAddresses.length > 0 ? (
              <div className="space-y-2">
                {customer.serviceAddresses.map((addr: ServiceAddress) => (
                  <div key={addr.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        {addr.isPrimary && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mb-1 inline-block">Primary</span>}
                        <p>{addr.address}</p>
                        {addr.notes && <p className="text-sm text-muted-foreground mt-1">{addr.notes}</p>}
                      </div>
                      {/* Only show work order button if appropriate for the role */}
                      {(!permissions.canViewOnlyAssociatedCustomers || 
                        (user?.associatedIds?.includes(customer.id))) && (
                        <Button 
                          size="sm" 
                          variant="ghost"
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
              <p>{customer.serviceAddress || 'No service address'}</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Billing Address</h4>
            <p>{customer.billAddress}</p>
          </div>

          {/* Show financial information based on permissions */}
          {permissions.canViewCustomerPaymentHistory && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Payment History</h4>
              <p className="text-sm text-muted-foreground">No payment history available.</p>
            </div>
          )}

          {permissions.canViewFuturePaymentPlans && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Payment Plans</h4>
              <p className="text-sm text-muted-foreground">No payment plans available.</p>
            </div>
          )}

          <div className="pt-4 flex justify-between">
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
