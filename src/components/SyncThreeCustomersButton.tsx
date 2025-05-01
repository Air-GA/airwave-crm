
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { syncThreeCustomers } from "@/services/customerSyncService";
import { useToast } from "@/hooks/use-toast";

interface SyncThreeCustomersButtonProps {
  onSyncComplete: () => void;  // Changed from onSuccess to onSyncComplete for consistency
}

export const SyncThreeCustomersButton = ({
  onSyncComplete,
}: SyncThreeCustomersButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      console.log("Starting residential customer sync...");
      await syncThreeCustomers();
      toast({
        title: "Sync Complete",
        description: "Successfully synced residential sample customers.",
      });
      onSyncComplete();
    } catch (error) {
      console.error("Error syncing residential customers:", error);
      
      // Show a detailed error message
      toast({
        title: "Sync Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to sync residential customers.",
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
