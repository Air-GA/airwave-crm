
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SyncButtonProps {
  onSync: () => Promise<boolean>;
  label: string;
  autoSync?: boolean;
  syncInterval?: number;
}

export function SyncButton({ onSync, label, autoSync = false, syncInterval = 3600000 }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Effect for auto sync
  useEffect(() => {
    if (!autoSync) return;
    
    // First sync after component mounts
    const initialTimeout = setTimeout(() => {
      handleSync();
    }, 2000);
    
    // Setup interval for recurring syncs
    const intervalId = setInterval(() => {
      handleSync();
    }, syncInterval);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [autoSync, syncInterval]);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const success = await onSync();
      if (success) {
        setLastSynced(new Date());
      }
    } catch (error) {
      console.error(`Error syncing ${label}:`, error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          <span>Syncing {label}...</span>
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Sync {label}</span>
          {lastSynced && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Last: {lastSynced.toLocaleTimeString()})
            </span>
          )}
        </>
      )}
    </Button>
  );
}
