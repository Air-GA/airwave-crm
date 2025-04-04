import { Customer, WorkOrder, InventoryItem } from "@/types";
import { toast } from "@/hooks/use-toast";

// Maximum number of items to store in a single localStorage chunk
const MAX_CHUNK_SIZE = 100;

/**
 * Import customer data with chunking to avoid quota limits
 * @param customers Array of customer objects to import
 * @returns Array of imported customer objects
 */
export const importCustomers = async (
  customers: Customer[]
): Promise<Customer[]> => {
  try {
    console.log("Starting customer import process...");
    
    if (!customers || customers.length === 0) {
      throw new Error("No valid customer data to import");
    }
    
    // Store in localStorage with chunking to avoid quota limits
    let existingCustomers: Customer[] = [];
    try {
      existingCustomers = JSON.parse(localStorage.getItem('imported_customers') || '[]');
    } catch (e) {
      console.warn("Error parsing existing customers, starting fresh", e);
      existingCustomers = [];
    }
    
    console.log(`Found ${existingCustomers.length} existing customers in storage`);
    
    if (customers.length > MAX_CHUNK_SIZE) {
      console.log(`Large import detected (${customers.length} items). Using chunked import.`);
      
      // Process in chunks to avoid localStorage limits
      const totalChunks = Math.ceil(customers.length / MAX_CHUNK_SIZE);
      let successfulImports = 0;
      
      for (let i = 0; i < totalChunks; i++) {
        const startIdx = i * MAX_CHUNK_SIZE;
        const endIdx = Math.min(startIdx + MAX_CHUNK_SIZE, customers.length);
        const chunk = customers.slice(startIdx, endIdx);
        
        try {
          const chunkKey = `imported_customers_chunk_${i}`;
          localStorage.setItem(chunkKey, JSON.stringify(chunk));
          successfulImports += chunk.length;
          console.log(`Successfully stored chunk ${i+1}/${totalChunks} (${chunk.length} customers)`);
        } catch (error) {
          console.error(`Error storing chunk ${i+1}/${totalChunks}:`, error);
          toast({
            title: "Import Warning",
            description: `Only ${successfulImports} customers could be imported due to storage limits.`,
            variant: "destructive",
          });
          return customers.slice(0, successfulImports);
        }
      }
      
      // Store the chunk index information
      try {
        localStorage.setItem('customer_chunks_count', totalChunks.toString());
        console.log(`Successfully imported ${successfulImports} customers in ${totalChunks} chunks`);
      } catch (error) {
        console.error("Error storing chunk metadata:", error);
      }
      
      return customers;
    } else {
      // For smaller imports, use the regular approach
      try {
        const updatedCustomers = [...existingCustomers, ...customers];
        localStorage.setItem('imported_customers', JSON.stringify(updatedCustomers));
        
        console.log(`Successfully imported ${customers.length} customers to localStorage`);
        console.log(`Total customers in storage: ${updatedCustomers.length}`);
        return customers;
      } catch (error) {
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          // Handle quota exceeded error
          toast({
            title: "Storage Limit Reached",
            description: "Your browser's storage limit has been reached. Try importing fewer customers or clearing existing data.",
            variant: "destructive",
          });
          throw new Error("Storage quota exceeded. Try importing fewer customers or clearing existing data.");
        } else {
          throw error;
        }
      }
    }
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
    
    if (!workOrders || workOrders.length === 0) {
      throw new Error("No valid work order data to import");
    }
    
    // Store in localStorage for demo purposes
    const existingWorkOrders = JSON.parse(localStorage.getItem('imported_work_orders') || '[]');
    const updatedWorkOrders = [...existingWorkOrders, ...workOrders];
    localStorage.setItem('imported_work_orders', JSON.stringify(updatedWorkOrders));
    
    console.log(`Successfully imported ${workOrders.length} work orders to localStorage`);
    console.log(`Total work orders in storage: ${updatedWorkOrders.length}`);
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
    
    if (!inventory || inventory.length === 0) {
      throw new Error("No valid inventory data to import");
    }
    
    // Store in localStorage for demo purposes
    const existingInventory = JSON.parse(localStorage.getItem('imported_inventory') || '[]');
    const updatedInventory = [...existingInventory, ...inventory];
    localStorage.setItem('imported_inventory', JSON.stringify(updatedInventory));
    
    console.log(`Successfully imported ${inventory.length} inventory items to localStorage`);
    console.log(`Total inventory items in storage: ${updatedInventory.length}`);
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

// Define interface for raw CSV/Excel data to allow for various naming conventions
interface RawCustomerData {
  [key: string]: any;
  id?: string;
  name?: string;
  Name?: string;
  customer_name?: string;
  CustomerName?: string;
  email?: string;
  Email?: string;
  phone?: string;
  Phone?: string;
  phone_number?: string;
  PhoneNumber?: string;
  address?: string;
  Address?: string;
  serviceAddress?: string;
  service_address?: string;
  ServiceAddress?: string;
  billAddress?: string;
  billing_address?: string;
  BillingAddress?: string;
  type?: string;
  Type?: string;
  customer_type?: string;
  CustomerType?: string;
  notes?: string;
  Notes?: string;
}

interface RawWorkOrderData {
  [key: string]: any;
  id?: string;
  customerId?: string;
  customer_id?: string;
  CustomerId?: string;
  customerName?: string;
  customer_name?: string;
  CustomerName?: string;
  address?: string;
  Address?: string;
  status?: string;
  Status?: string;
  priority?: string;
  Priority?: string;
  type?: string;
  Type?: string;
  description?: string;
  Description?: string;
  scheduledDate?: string;
  scheduled_date?: string;
  ScheduledDate?: string;
  createdAt?: string;
  created_at?: string;
  CreatedAt?: string;
  technicianId?: string;
  technician_id?: string;
  TechnicianId?: string;
  technicianName?: string;
  technician_name?: string;
  TechnicianName?: string;
  completedAt?: string;
  completed_at?: string;
  CompletedAt?: string;
  notes?: string[] | string;
  Notes?: string[] | string;
}

interface RawInventoryData {
  [key: string]: any;
  id?: string;
  name?: string;
  Name?: string;
  category?: string;
  Category?: string;
  description?: string;
  Description?: string;
  quantity?: number | string;
  Quantity?: number | string;
  price?: number | string;
  Price?: number | string;
  reorderLevel?: number | string;
  reorder_level?: number | string;
  ReorderLevel?: number | string;
  supplier?: string;
  Supplier?: string;
  location?: string;
  Location?: string;
  sku?: string;
  SKU?: string;
  unit_price?: number | string;
  unitPrice?: number | string;
  UnitPrice?: number | string;
}

// Simplified import functions with better type safety
export const processCustomerImport = async (rawData: RawCustomerData[]): Promise<number> => {
  try {
    if (!rawData || rawData.length === 0) {
      throw new Error("No valid customer data provided");
    }
    
    console.log(`Processing ${rawData.length} customer records for import`);
    
    // Process customers to ensure they have all required fields
    const validCustomers = rawData
      .filter(c => c.name || c.Name || c.customer_name || c.CustomerName)
      .map(c => {
        // Generate random coordinates near Georgia for the map view
        const lat = 33.7490 + (Math.random() - 0.5) * 2;
        const lng = -84.3880 + (Math.random() - 0.5) * 2;
        
        const id = c.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          id,
          name: c.name || c.Name || c.customer_name || c.CustomerName || "Unknown",
          email: c.email || c.Email || "",
          phone: c.phone || c.Phone || c.phone_number || c.PhoneNumber || "",
          address: c.address || c.Address || c.serviceAddress || c.ServiceAddress || "",
          serviceAddress: c.serviceAddress || c.service_address || c.ServiceAddress || c.address || c.Address || "",
          billAddress: c.billAddress || c.billing_address || c.BillingAddress || c.address || c.Address || "",
          type: c.type || c.Type || c.customer_type || c.CustomerType || "residential",
          createdAt: new Date().toISOString(),
          serviceAddresses: [
            {
              id: `sa-${id}-primary`,
              address: c.serviceAddress || c.service_address || c.ServiceAddress || c.address || c.Address || "",
              isPrimary: true
            }
          ],
          notes: c.notes || c.Notes || "",
          location: {
            lat,
            lng
          }
        } as Customer;
      });
    
    if (validCustomers.length === 0) {
      throw new Error("No valid customer records found in import data");
    }
    
    console.log(`Processed ${validCustomers.length} valid customer records for import`);
    await importCustomers(validCustomers);
    return validCustomers.length;
  } catch (error) {
    console.error("Error processing customer import:", error);
    throw error;
  }
};

export const processWorkOrderImport = async (rawData: RawWorkOrderData[]): Promise<number> => {
  try {
    if (!rawData || rawData.length === 0) {
      throw new Error("No valid work order data provided");
    }
    
    // Filter out invalid work orders before casting
    const validWorkOrders = rawData
      .filter(wo => wo.customerId || wo.customer_id || wo.CustomerId || wo.customerName || wo.customer_name || wo.CustomerName)
      .map(wo => ({
        id: wo.id || `wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId: wo.customerId || wo.customer_id || wo.CustomerId || `unknown-${Date.now()}`,
        customerName: wo.customerName || wo.customer_name || wo.CustomerName || "Unknown Customer",
        address: wo.address || wo.Address || "",
        status: wo.status || wo.Status || "pending",
        priority: wo.priority || wo.Priority || "medium",
        type: wo.type || wo.Type || "repair",
        description: wo.description || wo.Description || "",
        scheduledDate: wo.scheduledDate || wo.scheduled_date || wo.ScheduledDate || new Date().toISOString(),
        createdAt: wo.createdAt || wo.created_at || wo.CreatedAt || new Date().toISOString(),
        technicianId: wo.technicianId || wo.technician_id || wo.TechnicianId || undefined,
        technicianName: wo.technicianName || wo.technician_name || wo.TechnicianName || undefined,
        completedAt: wo.completedAt || wo.completed_at || wo.CompletedAt || undefined,
        notes: Array.isArray(wo.notes || wo.Notes) ? wo.notes || wo.Notes : []
      })) as WorkOrder[];
    
    if (validWorkOrders.length === 0) {
      throw new Error("No valid work order records found in import data");
    }
    
    await importWorkOrders(validWorkOrders);
    return validWorkOrders.length;
  } catch (error) {
    console.error("Error processing work order import:", error);
    throw error;
  }
};

export const processInventoryImport = async (rawData: RawInventoryData[]): Promise<number> => {
  try {
    if (!rawData || rawData.length === 0) {
      throw new Error("No valid inventory data provided");
    }
    
    // Filter out invalid inventory items before casting
    const validInventory = rawData
      .filter(item => item.name || item.Name || item.sku || item.SKU)
      .map(item => ({
        id: item.id || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || item.Name || `Item-${Math.random().toString(36).substr(2, 5)}`,
        category: item.category || item.Category || "Uncategorized",
        description: item.description || item.Description || "",
        quantity: Number(item.quantity || item.Quantity || 0),
        price: Number(item.price || item.Price || 0),
        reorderLevel: Number(item.reorderLevel || item.reorder_level || item.ReorderLevel || 5),
        supplier: item.supplier || item.Supplier || "",
        location: item.location || item.Location || "",
        sku: item.sku || item.SKU || `SKU-${Math.random().toString(36).substr(2, 7)}`,
        unit_price: Number(item.unit_price || item.unitPrice || item.UnitPrice || 0),
      })) as InventoryItem[];
    
    if (validInventory.length === 0) {
      throw new Error("No valid inventory records found in import data");
    }
    
    await importInventory(validInventory);
    return validInventory.length;
  } catch (error) {
    console.error("Error processing inventory import:", error);
    throw error;
  }
};

/**
 * Get all imported customers with chunk support
 * @returns Array of imported customers
 */
export const getImportedCustomers = (): Customer[] => {
  try {
    let allCustomers: Customer[] = [];
    
    // Check if we have chunked data
    const chunksCount = parseInt(localStorage.getItem('customer_chunks_count') || '0', 10);
    
    if (chunksCount > 0) {
      console.log(`Loading ${chunksCount} customer chunks from localStorage`);
      
      // Collect all chunks
      for (let i = 0; i < chunksCount; i++) {
        try {
          const chunkKey = `imported_customers_chunk_${i}`;
          const chunkData = JSON.parse(localStorage.getItem(chunkKey) || '[]');
          allCustomers = [...allCustomers, ...chunkData];
        } catch (e) {
          console.warn(`Error loading chunk ${i}:`, e);
        }
      }
    } else {
      // Regular storage approach
      allCustomers = JSON.parse(localStorage.getItem('imported_customers') || '[]');
    }
    
    console.log(`Retrieved ${allCustomers.length} imported customers from localStorage`);
    
    // Ensure all customers have the required properties to match Customer type
    const processedCustomers = allCustomers.map((customer: any) => {
      // Make sure each customer conforms to our expected Customer type
      return {
        id: customer.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: customer.name || 'Unknown',
        email: customer.email || '',
        phone: customer.phone || '',
        serviceAddress: customer.serviceAddress || customer.address || '',
        address: customer.address || customer.serviceAddress || '',  // Ensure address is always defined
        billAddress: customer.billAddress || customer.address || '',
        type: customer.type || 'residential',
        createdAt: customer.createdAt || new Date().toISOString(),
        lastService: customer.lastService || '',
        serviceAddresses: customer.serviceAddresses || [
          {
            id: `sa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            address: customer.serviceAddress || customer.address || '',
            isPrimary: true
          }
        ]
      } as Customer;
    });
    
    return processedCustomers;
  } catch (error) {
    console.error("Error getting imported customers:", error);
    toast({
      title: "Data Retrieval Error",
      description: `Failed to load imported customers: ${(error as Error).message}`,
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Get all imported work orders
 * @returns Array of imported work orders
 */
export const getImportedWorkOrders = (): WorkOrder[] => {
  try {
    const importedWorkOrders = JSON.parse(localStorage.getItem('imported_work_orders') || '[]');
    console.log(`Retrieved ${importedWorkOrders.length} imported work orders from localStorage`);
    return importedWorkOrders as WorkOrder[];
  } catch (error) {
    console.error("Error getting imported work orders:", error);
    toast({
      title: "Data Retrieval Error",
      description: `Failed to load imported work orders: ${(error as Error).message}`,
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Get all imported inventory items
 * @returns Array of imported inventory items
 */
export const getImportedInventory = (): InventoryItem[] => {
  try {
    const importedInventory = JSON.parse(localStorage.getItem('imported_inventory') || '[]');
    console.log(`Retrieved ${importedInventory.length} imported inventory items from localStorage`);
    return importedInventory as InventoryItem[];
  } catch (error) {
    console.error("Error getting imported inventory:", error);
    toast({
      title: "Data Retrieval Error",
      description: `Failed to load imported inventory: ${(error as Error).message}`,
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Clear all imported data from localStorage
 */
export const clearImportedData = (): void => {
  try {
    // Clear regular items
    localStorage.removeItem('imported_customers');
    localStorage.removeItem('imported_work_orders');
    localStorage.removeItem('imported_inventory');
    
    // Clear chunked customer data if it exists
    const chunksCount = parseInt(localStorage.getItem('customer_chunks_count') || '0', 10);
    if (chunksCount > 0) {
      for (let i = 0; i < chunksCount; i++) {
        localStorage.removeItem(`imported_customers_chunk_${i}`);
      }
      localStorage.removeItem('customer_chunks_count');
    }
    
    console.log("All imported data cleared from localStorage");
    
    toast({
      title: "Data Cleared",
      description: "All imported data has been successfully removed.",
    });
  } catch (error) {
    console.error("Error clearing imported data:", error);
    toast({
      title: "Operation Failed",
      description: `Failed to clear imported data: ${(error as Error).message}`,
      variant: "destructive",
    });
  }
};

/**
 * Calculate the approximate size of object in bytes
 * @param object The object to measure
 * @returns Size in bytes
 */
export const getObjectSizeInBytes = (object: any): number => {
  const jsonString = JSON.stringify(object);
  return new Blob([jsonString]).size;
};

/**
 * Check if adding the new data would exceed localStorage limits
 * @param key The localStorage key
 * @param newData The new data to be added
 * @returns Boolean indicating if it would exceed quota
 */
export const wouldExceedQuota = (key: string, newData: any): boolean => {
  try {
    // Test storing the data
    const testKey = `${key}_size_test`;
    localStorage.setItem(testKey, JSON.stringify(newData));
    localStorage.removeItem(testKey);
    return false;
  } catch (e) {
    if (e instanceof DOMException && 
       (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      return true;
    }
    return false;
  }
};
