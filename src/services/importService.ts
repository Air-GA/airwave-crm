import { Customer, WorkOrder, InventoryItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

/**
 * Import customer data
 * @param customers Array of customer objects to import
 * @returns Array of imported customer objects
 */
export const importCustomers = async (
  customers: Customer[]
): Promise<Customer[]> => {
  try {
    console.log("Starting customer import process...");
    
    // Store in localStorage for demo purposes
    const existingCustomers = JSON.parse(localStorage.getItem('imported_customers') || '[]');
    const updatedCustomers = [...existingCustomers, ...customers];
    localStorage.setItem('imported_customers', JSON.stringify(updatedCustomers));
    
    console.log(`Successfully imported ${customers.length} customers to localStorage`);
    return customers;
  } catch (error) {
    console.error("Error importing customers:", error);
    toast({
      title: "Import Error",
      description: `Error importing customers: ${(error as Error).message}`,
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Import work order data
 * @param workOrders Array of work order objects to import
 * @returns Array of imported work order objects
 */
export const importWorkOrders = async (
  workOrders: WorkOrder[]
): Promise<WorkOrder[]> => {
  try {
    console.log("Starting work order import process...");
    
    // Store in localStorage for demo purposes
    const existingWorkOrders = JSON.parse(localStorage.getItem('imported_work_orders') || '[]');
    const updatedWorkOrders = [...existingWorkOrders, ...workOrders];
    localStorage.setItem('imported_work_orders', JSON.stringify(updatedWorkOrders));
    
    console.log(`Successfully imported ${workOrders.length} work orders to localStorage`);
    return workOrders;
  } catch (error) {
    console.error("Error importing work orders:", error);
    toast({
      title: "Import Error",
      description: `Error importing work orders: ${(error as Error).message}`,
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Import inventory data
 * @param inventory Array of inventory objects to import
 * @returns Array of imported inventory objects
 */
export const importInventory = async (
  inventory: InventoryItem[]
): Promise<InventoryItem[]> => {
  try {
    console.log("Starting inventory import process...");
    
    // Store in localStorage for demo purposes
    const existingInventory = JSON.parse(localStorage.getItem('imported_inventory') || '[]');
    const updatedInventory = [...existingInventory, ...inventory];
    localStorage.setItem('imported_inventory', JSON.stringify(updatedInventory));
    
    console.log(`Successfully imported ${inventory.length} inventory items to localStorage`);
    return inventory;
  } catch (error) {
    console.error("Error importing inventory:", error);
    toast({
      title: "Import Error",
      description: `Error importing inventory: ${(error as Error).message}`,
      variant: "destructive",
    });
    throw error;
  }
};

// Simplified import functions with better type safety
export const processCustomerImport = async (customers: Partial<Customer>[]): Promise<number> => {
  try {
    // Cast to Customer[] after validation if needed
    const validCustomers = customers.filter(c => c.name) as Customer[];
    await importCustomers(validCustomers);
    return validCustomers.length;
  } catch (error) {
    console.error("Error processing customer import:", error);
    throw error;
  }
};

export const processWorkOrderImport = async (workOrders: Partial<WorkOrder>[]): Promise<number> => {
  try {
    // Filter out invalid work orders before casting
    const validWorkOrders = workOrders.filter(wo => 
      wo.customerId && wo.address && wo.type && wo.description
    ) as WorkOrder[];
    
    await importWorkOrders(validWorkOrders);
    return validWorkOrders.length;
  } catch (error) {
    console.error("Error processing work order import:", error);
    throw error;
  }
};

export const processInventoryImport = async (inventory: Partial<InventoryItem>[]): Promise<number> => {
  try {
    // Filter out invalid inventory items before casting
    const validInventory = inventory.filter(item => 
      item.name && item.category
    ) as InventoryItem[];
    
    await importInventory(validInventory);
    return validInventory.length;
  } catch (error) {
    console.error("Error processing inventory import:", error);
    throw error;
  }
};

/**
 * Get all imported customers
 * @returns Array of imported customers
 */
export const getImportedCustomers = (): Customer[] => {
  return JSON.parse(localStorage.getItem('imported_customers') || '[]');
};

/**
 * Get all imported work orders
 * @returns Array of imported work orders
 */
export const getImportedWorkOrders = (): WorkOrder[] => {
  return JSON.parse(localStorage.getItem('imported_work_orders') || '[]');
};

/**
 * Get all imported inventory items
 * @returns Array of imported inventory items
 */
export const getImportedInventory = (): any[] => {
  return JSON.parse(localStorage.getItem('imported_inventory') || '[]');
};
