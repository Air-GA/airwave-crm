
/**
 * API Integration Service
 * 
 * This service manages integrations with external APIs and services
 */

export interface ProfitRhinoInventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  cost: number;
  price: number;
  category: string;
  subcategory?: string;
  manufacturer?: string;
  unit?: string;
  taxable: boolean;
}

export interface ProfitRhinoPricebook {
  id: string;
  name: string;
  description: string;
  active: boolean;
  default: boolean;
  itemCount: number;
  lastUpdated: string;
}

const apiIntegrationService = {
  // Profit Rhino integration
  profitRhino: {
    // Sync inventory with Profit Rhino
    syncInventory: async (): Promise<boolean> => {
      // Simulate API call with a delay
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Synced inventory with Profit Rhino');
          resolve(true);
        }, 1500);
      });
    },

    // Get inventory items from Profit Rhino
    getInventoryItems: async (): Promise<ProfitRhinoInventoryItem[]> => {
      // Simulate API call with a delay
      return new Promise((resolve) => {
        setTimeout(() => {
          const items: ProfitRhinoInventoryItem[] = [
            {
              id: 'pr-001',
              name: 'Air Filter 16x20',
              sku: 'AF1620',
              description: 'MERV 11 air filter',
              cost: 8.50,
              price: 22.99,
              category: 'supplies',
              subcategory: 'filters',
              manufacturer: 'FilterPro',
              unit: 'each',
              taxable: true
            },
            {
              id: 'pr-002',
              name: 'Capacitor 45/5 MFD',
              sku: 'CAP455',
              description: '45/5 MFD 370V Dual Run Capacitor',
              cost: 12.75,
              price: 68.50,
              category: 'parts',
              subcategory: 'electrical',
              manufacturer: 'TEMCo',
              unit: 'each',
              taxable: true
            },
            {
              id: 'pr-003',
              name: 'R410A Refrigerant',
              sku: 'R410A-25',
              description: 'R410A Refrigerant - 25lb Cylinder',
              cost: 85.00,
              price: 195.00,
              category: 'supplies',
              subcategory: 'refrigerant',
              manufacturer: 'Chemours',
              unit: 'cylinder',
              taxable: true
            }
          ];
          resolve(items);
        }, 1000);
      });
    },

    // Get pricebooks from Profit Rhino
    getPricebooks: async (): Promise<ProfitRhinoPricebook[]> => {
      // Simulate API call with a delay
      return new Promise((resolve) => {
        setTimeout(() => {
          const pricebooks: ProfitRhinoPricebook[] = [
            {
              id: 'pb-001',
              name: 'Standard Residential',
              description: 'Standard pricing for residential customers',
              active: true,
              default: true,
              itemCount: 1250,
              lastUpdated: '2023-06-15T10:30:00Z'
            },
            {
              id: 'pb-002',
              name: 'Commercial',
              description: 'Pricing for commercial customers',
              active: true,
              default: false,
              itemCount: 1120,
              lastUpdated: '2023-06-10T14:15:00Z'
            },
            {
              id: 'pb-003',
              name: 'Maintenance Plan Members',
              description: 'Special pricing for maintenance plan members',
              active: true,
              default: false,
              itemCount: 1250,
              lastUpdated: '2023-06-12T09:45:00Z'
            }
          ];
          resolve(pricebooks);
        }, 1000);
      });
    }
  }
};

export default apiIntegrationService;
