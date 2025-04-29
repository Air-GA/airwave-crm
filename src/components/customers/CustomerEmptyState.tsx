
import { UserRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerEmptyStateProps {
  userRole: string;
  onAddCustomer: () => void;
  canAddCustomer: boolean;
}

export const CustomerEmptyState = ({ 
  userRole, 
  onAddCustomer, 
  canAddCustomer
}: CustomerEmptyStateProps) => {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <UserRound className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">
        {userRole === 'sales' 
          ? 'No customers assigned to you' 
          : 'No customers found'}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {userRole === 'sales' 
          ? 'You don\'t have any customers assigned to you yet.' 
          : 'Try adjusting your search, or add a new customer.'}
      </p>
      {canAddCustomer && (
        <Button className="mt-4" onClick={onAddCustomer}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      )}
    </div>
  );
};
