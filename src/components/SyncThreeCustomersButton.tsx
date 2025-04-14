
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { syncThreeCustomers } from "@/services/customerSyncService";
import { useToast } from "@/hooks/use-toast";

interface SyncThreeCustomersButtonProps {
  onSyncComplete: () => void;
}

export const SyncThreeCustomersButton = ({
  onSyncComplete,
}: SyncThreeCustomersButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncThreeCustomers();
      toast({
        title: "Sync Complete",
        description: "Successfully synced three sample customers.",
      });
      onSyncComplete();
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync customers.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      variant="outline"
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
