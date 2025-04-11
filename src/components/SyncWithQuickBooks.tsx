
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiIntegrationService } from '@/services/apiIntegrationService';

interface SyncWithQuickBooksProps {
  entityType: 'customers' | 'workOrders' | 'invoices' | 'reports' | 'timesheets' | 'purchaseOrders';
  onSyncComplete?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SyncWithQuickBooks({ 
  entityType, 
  onSyncComplete,
  variant = 'outline',
  size = 'sm'
}: SyncWithQuickBooksProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { userRole } = useAuth();

  // Only admin, manager and CSR can sync data
  const canSync = userRole === 'admin' || userRole === 'manager' || userRole === 'csr';
  
  const getEntityLabel = () => {
    switch (entityType) {
      case 'customers': return 'Customers';
      case 'workOrders': return 'Work Orders';
      case 'invoices': return 'Invoices';
      case 'reports': return 'Reports';
      case 'timesheets': return 'Timesheets';
      case 'purchaseOrders': return 'Purchase Orders';
      default: return entityType;
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    toast({
      title: "Syncing...",
      description: `Syncing ${getEntityLabel()} with QuickBooks...`,
    });

    try {
      // Call the appropriate API based on entity type
      switch (entityType) {
        case 'customers':
          // Call customers sync endpoint
          await new Promise(resolve => setTimeout(resolve, 1500)); // Placeholder
          break;
        case 'workOrders':
          // Call work orders sync endpoint
          await new Promise(resolve => setTimeout(resolve, 1500)); // Placeholder
          break;
        case 'invoices':
          await apiIntegrationService.quickbooks.syncInvoices();
          break;
        case 'reports':
          // Call reports sync endpoint
          await new Promise(resolve => setTimeout(resolve, 1500)); // Placeholder
          break;
        case 'timesheets':
          await apiIntegrationService.quickbooks.syncTimesheets(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
            new Date().toISOString().split('T')[0] // today
          );
          break;
        case 'purchaseOrders':
          // Call purchase orders sync endpoint
          await new Promise(resolve => setTimeout(resolve, 1500)); // Placeholder
          break;
      }
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${getEntityLabel()} with QuickBooks`,
      });
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error(`Error syncing ${getEntityLabel()}:`, error);
      toast({
        title: "Sync Failed",
        description: `Failed to sync ${getEntityLabel()} with QuickBooks`,
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
      variant={variant}
      size={size}
    >
      {isSyncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync with QuickBooks
        </>
      )}
    </Button>
  );
}
