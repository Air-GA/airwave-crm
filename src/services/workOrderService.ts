
// Re-export functions and hooks from workOrderStore
export { useWorkOrderStore } from "@/services/workOrderStore";

// Re-export functions from workOrderUtils
export {
  assignWorkOrder,
  unassignWorkOrder,
  createWorkOrder,
  createMaintenanceWorkOrder,
  rescheduleMaintenanceWorkOrder,
  markOrderPendingCompletion,
} from "@/services/workOrderUtils";

// Directly export any additional functions specific to this service
import { WorkOrder } from "@/types";

// Update work order
export const updateWorkOrder = async (
  workOrderId: string,
  updates: Partial<WorkOrder>
): Promise<WorkOrder | null> => {
  try {
    // Get the current work order from the store
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === workOrderId);
    
    if (!workOrder) {
      console.error("Work order not found:", workOrderId);
      return null;
    }
    
    // Update the work order
    const updatedWorkOrder = {
      ...workOrder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, this would be an API call
    // For now, update the store
    updateWorkOrder(updatedWorkOrder);
    
    return updatedWorkOrder;
  } catch (error) {
    console.error("Error updating work order:", error);
    throw error;
  }
};
