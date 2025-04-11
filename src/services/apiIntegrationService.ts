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
    
    // Add syncServiceAddresses method
    syncServiceAddresses: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, this would be an API call to sync QuickBooks addresses
      console.log("Syncing service addresses from QuickBooks");
      
      return { success: true, message: "Service addresses synced successfully" };
    },
  },
};
