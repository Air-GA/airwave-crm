
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SyncButtonProps {
  onSync: () => Promise<any>;
  label: string;
  autoSync?: boolean;
  syncInterval?: number;
}

export function SyncButton({ onSync, label, autoSync = false, syncInterval = 3600000 }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await onSync();
    } catch (error) {
      console.error(`Error syncing ${label}:`, error);
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
          <span>Sync {label}</span>
        </>
      )}
    </Button>
  );
}
