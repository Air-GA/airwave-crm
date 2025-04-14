
// Mock API integration service
export const apiIntegrationService = {
  quickbooks: {
    syncCustomers: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, this would be an API call to sync QuickBooks customers
      console.log("Syncing customers from QuickBooks");
      
      return { success: true, message: "Customers synced successfully" };
    },
    
    syncServiceAddresses: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, this would be an API call to sync QuickBooks addresses
      console.log("Syncing service addresses from QuickBooks");
      
      return { success: true, message: "Service addresses synced successfully" };
    },

    // Adding the missing methods
    syncWorkOrders: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Syncing work orders from QuickBooks");
      
      return { success: true, message: "Work orders synced successfully" };
    },
    
    syncInvoices: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Syncing invoices from QuickBooks");
      
      return { success: true, message: "Invoices synced successfully" };
    },
    
    syncReports: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Syncing reports from QuickBooks");
      
      return { success: true, message: "Reports synced successfully" };
    },
    
    syncTimesheets: async (fromDate?: string, toDate?: string) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Syncing timesheets from QuickBooks (${fromDate} to ${toDate})`);
      
      return { success: true, message: "Timesheets synced successfully" };
    },
    
    syncPurchaseOrders: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Syncing purchase orders from QuickBooks");
      
      return { success: true, message: "Purchase orders synced successfully" };
    },
  },
};
