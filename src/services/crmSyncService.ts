
import { workOrders, technicians } from '@/data/mockData';
import { WorkOrder, Technician } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

const API_ENDPOINT = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-sync`
  : '/api/crm-sync';

/**
 * Sync technicians from CRM system
 * This is a mock implementation that simulates API calls
 */
export const syncTechniciansFromCRM = async (): Promise<Technician[]> => {
  console.log("Syncing technicians from CRM...");
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Synced technicians from CRM:", technicians.length);
    
    // Transform technicians from mockData to match our app's Technician type
    const transformedTechnicians: Technician[] = technicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      status: tech.status,
      specialties: tech.specialties,
      current_location_lat: tech.currentLocation?.lat,
      current_location_lng: tech.currentLocation?.lng,
      current_location_address: tech.currentLocation?.address
    }));
    
    toast({
      title: "Sync Successful",
      description: `Successfully synced ${transformedTechnicians.length} technicians from CRM`,
    });
    
    return transformedTechnicians;
  } catch (error) {
    console.error("Error syncing technicians from CRM:", error);
    toast({
      title: "Sync Failed",
      description: "Could not sync technicians from CRM. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

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
    console.log("Synced work orders from CRM:", workOrders.length);
    
    // Map workOrders from mockData to match the WorkOrder type
    const transformedOrders = workOrders.map(order => {
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
 * Push technician updates to CRM system
 * This is a mock implementation that simulates API calls
 */
export const pushTechnicianUpdateToCRM = async (technician: Technician): Promise<boolean> => {
  console.log("Pushing technician update to CRM:", technician);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Successfully pushed technician update to CRM: ${technician.name}`);
    toast({
      title: "Update Successful",
      description: `Successfully updated ${technician.name} in the CRM`,
    });
    
    return true;
  } catch (error) {
    console.error("Error pushing technician update to CRM:", error);
    toast({
      title: "Update Failed",
      description: "Could not update technician in the CRM. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Push work order updates to CRM system
 * This is a mock implementation that simulates API calls
 */
export const pushWorkOrderUpdateToCRM = async (workOrder: WorkOrder): Promise<boolean> => {
  console.log("Pushing work order update to CRM:", workOrder);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Successfully pushed work order update to CRM: #${workOrder.id}`);
    toast({
      title: "Update Successful",
      description: `Successfully updated work order #${workOrder.id} in the CRM`,
    });
    
    return true;
  } catch (error) {
    console.error("Error pushing work order update to CRM:", error);
    toast({
      title: "Update Failed",
      description: "Could not update work order in the CRM. Please try again.",
      variant: "destructive",
    });
    return false;
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
      customerId: customerData.id || uuidv4(),
      customerName: customerData.name,
      email: customerData.email,
      phoneNumber: customerData.phone,
      address: customerData.address,
      type: "maintenance",
      description: "Generated from CRM system",
      priority: "medium",
      scheduledDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
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
