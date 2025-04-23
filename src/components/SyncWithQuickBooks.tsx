
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface SyncWithQuickBooksProps {
  entityType?: string;  // Making entityType optional
  onSyncComplete?: () => void;
}

export function SyncWithQuickBooks({ entityType = 'data', onSyncComplete }: SyncWithQuickBooksProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      // This is just a placeholder - no actual sync happens
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error(`Error syncing ${entityType}:`, error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Sync Data</span>
        </>
      )}
    </Button>
  );
}
