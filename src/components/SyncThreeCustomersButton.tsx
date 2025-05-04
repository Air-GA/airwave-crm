
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { syncThreeCustomers } from "@/services/customerSyncService";
import { toast } from "sonner";

interface SyncThreeCustomersButtonProps {
  onSyncComplete: () => void;
}

export const SyncThreeCustomersButton = ({
  onSyncComplete,
}: SyncThreeCustomersButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      console.log("Starting customer sync...");
      await syncThreeCustomers();
      toast.success("Successfully synced sample customers");
      onSyncComplete();
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sync customers");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      variant="default"
      disabled={isSyncing}
      className="flex items-center gap-1"
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-1" />
      )}
      Sync 3 Sample Customers
    </Button>
  );
};
