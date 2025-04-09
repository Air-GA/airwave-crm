
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

// Types for API responses
interface ProfitRhinoInventoryItem {
  id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  markup: number;
  category: string;
  description?: string;
}

interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  jobId?: string;
  customerName?: string;
  notes?: string;
}

export interface QuickBooksEmployee {
  id: string;
  displayName: string;
  givenName: string;
  familyName: string;
  active: boolean;
}

export interface ProfitRhinoPricebook {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  lastUpdated: string;
}

/**
 * Service for handling API integrations with QuickBooks and Profit Rhino
 */
export const apiIntegrationService = {
  // QuickBooks Integration
  quickbooks: {
    async syncTimesheets(fromDate: string, toDate: string): Promise<boolean> {
      try {
        // Get timesheets from local storage
        const clockEvents = localStorage.getItem('clockEvents');
        const timesheetEntries = clockEvents ? JSON.parse(clockEvents) : [];
        
        // Format timesheet entries for QuickBooks
        const qbTimesheetEntries = formatTimesheetsForQuickBooks(timesheetEntries);
        
        // This would be an actual API call to QuickBooks in a real implementation
        console.log('Syncing timesheets with QuickBooks:', qbTimesheetEntries);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success("Timesheets synchronized with QuickBooks");
        return true;
      } catch (error) {
        console.error('Error syncing timesheets with QuickBooks:', error);
        toast.error("Failed to sync timesheets with QuickBooks");
        return false;
      }
    },
    
    async syncInvoices(): Promise<boolean> {
      try {
        // This would be an actual API call to QuickBooks in a real implementation
        console.log('Syncing invoices with QuickBooks');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success("Invoices synchronized with QuickBooks");
        return true;
      } catch (error) {
        console.error('Error syncing invoices with QuickBooks:', error);
        toast.error("Failed to sync invoices with QuickBooks");
        return false;
      }
    },
    
    async getEmployees(): Promise<QuickBooksEmployee[]> {
      try {
        // This would be an actual API call to QuickBooks in a real implementation
        console.log('Fetching employees from QuickBooks');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return mock data
        return [
          { id: "1", displayName: "Mike Johnson", givenName: "Mike", familyName: "Johnson", active: true },
          { id: "2", displayName: "Sarah Williams", givenName: "Sarah", familyName: "Williams", active: true },
          { id: "3", displayName: "David Chen", givenName: "David", familyName: "Chen", active: true },
          { id: "4", displayName: "Emily Davis", givenName: "Emily", familyName: "Davis", active: true },
          { id: "5", displayName: "Robert Brown", givenName: "Robert", familyName: "Brown", active: false }
        ];
      } catch (error) {
        console.error('Error fetching employees from QuickBooks:', error);
        toast.error("Failed to fetch employees from QuickBooks");
        return [];
      }
    }
  },
  
  // Profit Rhino Integration
  profitRhino: {
    async syncInventory(): Promise<boolean> {
      try {
        // This would be an actual API call to Profit Rhino in a real implementation
        console.log('Syncing inventory with Profit Rhino');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Fetch mock inventory items
        const items = await this.getInventoryItems();
        
        // Update inventory items with Profit Rhino pricing
        const inventoryItems = await supabase.from('inventory').select('*');
        
        if (inventoryItems.error) {
          throw new Error('Failed to fetch inventory items');
        }
        
        // In a real implementation, we would update the inventory prices
        console.log('Updating inventory items with Profit Rhino pricing', items);
        
        toast.success("Inventory synchronized with Profit Rhino");
        return true;
      } catch (error) {
        console.error('Error syncing inventory with Profit Rhino:', error);
        toast.error("Failed to sync inventory with Profit Rhino");
        return false;
      }
    },
    
    async getInventoryItems(): Promise<ProfitRhinoInventoryItem[]> {
      try {
        // This would be an actual API call to Profit Rhino in a real implementation
        console.log('Fetching inventory items from Profit Rhino');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return mock data
        return [
          {
            id: "pr1",
            name: "Air Conditioner Compressor",
            sku: "AC-COMP-2200",
            cost: 245.99,
            price: 319.99,
            markup: 30,
            category: "HVAC Parts"
          },
          {
            id: "pr2",
            name: "Furnace Motor",
            sku: "FUR-MTR-1500",
            cost: 189.50,
            price: 246.35,
            markup: 30,
            category: "HVAC Parts"
          },
          {
            id: "pr3",
            name: "Refrigerant - R410A",
            sku: "REF-R410A-10",
            cost: 95.00,
            price: 123.50,
            markup: 30,
            category: "Chemicals"
          },
          {
            id: "pr4",
            name: "Air Handler",
            sku: "AIR-HND-3000",
            cost: 499.99,
            price: 649.99,
            markup: 30,
            category: "HVAC Units"
          },
          {
            id: "pr5",
            name: "Thermostat - Digital Programmable",
            sku: "THERM-DIG-100",
            cost: 65.00,
            price: 84.50,
            markup: 30,
            category: "Controls"
          }
        ];
      } catch (error) {
        console.error('Error fetching inventory items from Profit Rhino:', error);
        toast.error("Failed to fetch inventory items from Profit Rhino");
        return [];
      }
    },
    
    async getPricebooks(): Promise<ProfitRhinoPricebook[]> {
      try {
        // This would be an actual API call to Profit Rhino in a real implementation
        console.log('Fetching pricebooks from Profit Rhino');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return mock data
        return [
          {
            id: "pb1",
            name: "Standard HVAC Pricing",
            description: "Standard pricing for residential HVAC services",
            isDefault: true,
            lastUpdated: "2025-03-15T10:00:00Z"
          },
          {
            id: "pb2",
            name: "Commercial HVAC",
            description: "Pricing for commercial HVAC services",
            isDefault: false,
            lastUpdated: "2025-03-10T14:30:00Z"
          },
          {
            id: "pb3",
            name: "Premium Residential",
            description: "Premium pricing for high-end residential customers",
            isDefault: false,
            lastUpdated: "2025-02-28T09:15:00Z"
          }
        ];
      } catch (error) {
        console.error('Error fetching pricebooks from Profit Rhino:', error);
        toast.error("Failed to fetch pricebooks from Profit Rhino");
        return [];
      }
    }
  }
};

// Helper function to format timesheet entries for QuickBooks
function formatTimesheetsForQuickBooks(entries: any[]): TimesheetEntry[] {
  return entries.reduce((acc: TimesheetEntry[], event: any, index: number, arr: any[]) => {
    // Only process 'in' events that have matching 'out' events
    if (event.type === 'in') {
      const outEvent = arr.find(e => 
        e.type === 'out' && 
        e.userId === event.userId && 
        new Date(e.timestamp).getTime() > new Date(event.timestamp).getTime()
      );
      
      if (outEvent) {
        const clockIn = new Date(event.timestamp);
        const clockOut = new Date(outEvent.timestamp);
        const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        
        acc.push({
          id: `${event.id}-${outEvent.id}`,
          employeeId: event.userId,
          employeeName: event.userName,
          date: clockIn.toISOString().split('T')[0],
          clockIn: clockIn.toISOString(),
          clockOut: clockOut.toISOString(),
          hours: parseFloat(hours.toFixed(2))
        });
      }
    }
    
    return acc;
  }, []);
}

export default apiIntegrationService;
