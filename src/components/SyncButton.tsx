
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SyncButtonProps {
  onSync: () => Promise<any>;
  label: string;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

export function SyncButton({ 
  onSync, 
  label, 
  autoSync = false, 
  syncInterval = 300000 // default to 5 minutes
}: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { userRole, permissions } = useAuth();

  // Only admin, manager and CSR can sync data
  const canSync = userRole === 'admin' || userRole === 'manager' || userRole === 'csr';
  
  useEffect(() => {
    // Set up auto-sync if enabled
    let intervalId: number | undefined;
    
    if (autoSync && canSync) {
      // Initial sync on load
      handleSync();
      
      // Set up interval for continuous sync
      intervalId = window.setInterval(() => {
        if (!isSyncing) {
          handleSync();
        }
      }, syncInterval);
    }
    
    // Clean up interval on component unmount
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [autoSync, syncInterval, canSync]);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    toast({
      title: "Syncing...",
      description: `Syncing ${label} from CRM...`,
    });

    try {
      await onSync();
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${label} with QuickBooks`,
      });
    } catch (error) {
      console.error(`Error syncing ${label}:`, error);
      toast({
        title: "Sync Failed",
        description: `Failed to sync ${label} from CRM`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!canSync) {
    return null; // Don't show the button if user doesn't have permission
  }

  return (
    <Button 
      onClick={handleSync} 
      disabled={isSyncing}
      variant="outline"
      size="sm"
    >
      {isSyncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {autoSync ? `Auto-Sync ${label}` : `Sync ${label}`}
        </>
      )}
    </Button>
  );
}
