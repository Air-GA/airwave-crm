
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerCSVUpload } from "./CustomerCSVUpload";
import { SyncThreeCustomersButton } from "@/components/SyncThreeCustomersButton";

interface CustomersHeaderProps {
  onAddCustomer: () => void;
  onSyncComplete: () => void;
}

export const CustomersHeader = ({ onAddCustomer, onSyncComplete }: CustomersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
      <div className="flex space-x-2">
        <CustomerCSVUpload onUploadComplete={onSyncComplete} />
        <Button variant="default" size="sm" onClick={onAddCustomer}>
          <Plus className="h-4 w-4 mr-1" />
          Add Customer
        </Button>
        <SyncThreeCustomersButton onSyncComplete={onSyncComplete} />
      </div>
    </div>
  );
};
