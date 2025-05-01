
import { Button } from "@/components/ui/button";
import { FileUp, Plus, RefreshCw } from "lucide-react";
import { SyncThreeCustomersButton } from "../SyncThreeCustomersButton";

interface CustomerEmptyStateProps {
  userRole?: string;
  onAddCustomer: () => void;
  canAddCustomer: boolean;
  onRefresh?: () => void;
}

export const CustomerEmptyState = ({
  userRole = "admin",
  onAddCustomer,
  canAddCustomer,
  onRefresh
}: CustomerEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-md bg-muted/30">
      <div className="mb-6 bg-primary/10 p-4 rounded-full">
        <FileUp className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Customers Found</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {userRole === 'customer' 
          ? 'No customer information is available for your account.' 
          : 'You haven\'t added any customers yet. Start by adding your first customer or importing from CSV.'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {canAddCustomer && (
          <Button variant="default" onClick={onAddCustomer}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        )}
        
        <SyncThreeCustomersButton 
          onSyncComplete={onRefresh ?? (() => {})} 
        />
        
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
          </Button>
        )}
      </div>
    </div>
  );
};
