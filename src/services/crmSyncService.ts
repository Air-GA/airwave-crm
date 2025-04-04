
import { mockWorkOrders } from '@/data/mockData';
import { WorkOrder } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

const API_ENDPOINT = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-sync`
  : '/api/crm-sync';

/**
 * Sync work orders from CRM system
 * This is a mock implementation that simulates API calls
 */
export const syncWorkOrdersFromCRM = async (): Promise<WorkOrder[]> => {
  console.log("Syncing work orders from CRM...");
  
  // In a real implementation, this would be an API call to fetch data from CRM
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For this mock, we're returning predefined mock data
    console.log("Synced work orders from CRM:", mockWorkOrders.length);
    
    // Map mockWorkOrders from mockData to match the WorkOrder type
    const transformedOrders = mockWorkOrders.map(order => {
      // Map partsUsed.price to partsUsed.cost
      const transformedOrder = {
        ...order,
        partsUsed: order.partsUsed?.map(part => ({
          id: part.id,
          name: part.name,
          quantity: part.quantity,
          price: part.price, // Keep price for compatibility
          cost: part.price    // Map price to cost
        })) || []
      };
      return transformedOrder;
    });
    
    toast({
      title: "Sync Successful",
      description: `Successfully synced ${transformedOrders.length} work orders from CRM`,
    });
    
    return transformedOrders;
  } catch (error) {
    console.error("Error syncing work orders from CRM:", error);
    toast({
      title: "Sync Failed",
      description: "Could not sync work orders from CRM. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Sync work orders to CRM system
 * This is a mock implementation that simulates API calls
 */
export const syncWorkOrdersToCRM = async (workOrders: WorkOrder[]): Promise<boolean> => {
  console.log("Syncing work orders to CRM...");
  
  // In a real implementation, this would be an API call to send data to CRM
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`Successfully synced ${workOrders.length} work orders to CRM`);
    toast({
      title: "Sync Successful",
      description: `Successfully synced ${workOrders.length} work orders to CRM`,
    });
    
    return true;
  } catch (error) {
    console.error("Error syncing work orders to CRM:", error);
    toast({
      title: "Sync Failed",
      description: "Could not sync work orders to CRM. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Generate a new work order with CRM integration
 * This is a mock implementation that simulates API calls
 */
export const generateWorkOrderInCRM = async (customerData: any): Promise<WorkOrder | null> => {
  console.log("Generating work order in CRM...");
  
  // In a real implementation, this would be an API call to CRM system
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock work order
    const workOrder: WorkOrder = {
      id: uuidv4(),
      customerName: customerData.name,
      email: customerData.email,
      phoneNumber: customerData.phone,
      address: customerData.address,
      type: "maintenance",
      description: "Generated from CRM system",
      priority: "medium",
      scheduledDate: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      status: "pending",
      estimatedHours: 2,
      partsUsed: []
    };
    
    console.log("Generated work order:", workOrder);
    toast({
      title: "Work Order Created",
      description: `Work order #${workOrder.id.substring(0, 8)} created in CRM system`,
    });
    
    return workOrder;
  } catch (error) {
    console.error("Error generating work order in CRM:", error);
    toast({
      title: "Error",
      description: "Could not generate work order in CRM system. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};
