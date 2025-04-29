
import { workOrders } from '@/data/mockData';
import { WorkOrder } from '@/types';
import { useWorkOrderStore } from './workOrderStore';

/**
 * Simulates syncing work orders from an external CRM
 * @returns Array of synced work orders
 */
export async function syncWorkOrdersFromCRM(): Promise<WorkOrder[]> {
  try {
    console.log("Attempting to sync work orders from CRM...");
    
    // In a real application, this would make an API call to the CRM system
    // For this demo, we'll simulate a delay and return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful response
    const response = {
      success: true,
      data: workOrders.map(order => ({
        ...order,
        syncedFromCRM: true,
        syncTimestamp: new Date().toISOString()
      }))
    };
    
    // Save to store
    if (response.success && response.data.length > 0) {
      useWorkOrderStore.getState().setWorkOrders(response.data);
      
      // Also save to localStorage as fallback
      localStorage.setItem('workOrders', JSON.stringify(response.data));
      
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error syncing from CRM:", error);
    throw new Error("Failed to sync from CRM");
  }
}

/**
 * Update the status of a work order in the CRM
 * @param workOrderId Work order ID
 * @param status New status
 * @returns Success indicator
 */
export async function updateWorkOrderStatusInCRM(
  workOrderId: string,
  status: WorkOrder['status']
): Promise<boolean> {
  try {
    // In a real application, this would make an API call to update the CRM
    console.log(`Updating work order ${workOrderId} status to ${status} in CRM...`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate success
    return true;
  } catch (error) {
    console.error(`Error updating work order ${workOrderId} in CRM:`, error);
    return false;
  }
}

/**
 * This function is used to send maintenance plan information to the CRM
 * @param workOrderId The work order ID
 * @param maintenanceDetails The maintenance details
 * @returns Success indicator
 */
export async function sendMaintenancePlanToCRM(
  workOrderId: string,
  maintenanceDetails: {
    customerId: string;
    scheduledDate: string;
    technicianId?: string;
    preferredTime?: string;
  }
): Promise<boolean> {
  try {
    console.log(`Sending maintenance plan for work order ${workOrderId} to CRM...`);
    console.log('Maintenance details:', maintenanceDetails);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success
    return true;
  } catch (error) {
    console.error(`Error sending maintenance plan to CRM:`, error);
    return false;
  }
}

/**
 * Get scheduled maintenance plans from CRM
 * This would typically fetch from an API, but we're using mock data
 */
export async function getMaintenancePlansFromCRM() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock maintenance data - using type filtering instead of isMaintenancePlan property
  return workOrders.filter(order => 
    order.type === 'maintenance'
  );
}
