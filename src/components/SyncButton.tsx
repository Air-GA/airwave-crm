
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SyncButtonProps {
  onSync: () => Promise<any>;
  label: string;
}

export function SyncButton({ onSync, label }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast({
      title: "Syncing...",
      description: `Syncing ${label} from CRM...`,
    });

    try {
      await onSync();
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
          Sync {label}
        </>
      )}
    </Button>
  );
}
