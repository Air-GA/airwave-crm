
// Import the useWorkOrderStore from workOrderStore
import { useWorkOrderStore } from "@/services/workOrderStore";

// Re-export the store
export { useWorkOrderStore };

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

// Fetch work orders
export const fetchWorkOrders = async (forceRefresh?: boolean): Promise<WorkOrder[]> => {
  try {
    const { workOrders } = useWorkOrderStore.getState();
    console.log("Fetching work orders:", workOrders.length);
    return workOrders;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }
};

// Complete work order
export const completeWorkOrder = async (
  workOrderId: string,
  completionDetails: any
): Promise<WorkOrder | null> => {
  try {
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === workOrderId);
    
    if (!workOrder) {
      console.error("Work order not found:", workOrderId);
      return null;
    }
    
    const now = new Date().toISOString();
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      status: "completed" as const,
      completedDate: now,
      updatedAt: now,
    };
    
    // In a real app, this would be an API call
    updateWorkOrder(updatedWorkOrder);
    
    return updatedWorkOrder;
  } catch (error) {
    console.error("Error completing work order:", error);
    throw error;
  }
};

// Cancel work order
export const cancelWorkOrder = async (
  workOrderId: string,
  reason?: string
): Promise<WorkOrder | null> => {
  try {
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === workOrderId);
    
    if (!workOrder) {
      console.error("Work order not found:", workOrderId);
      return null;
    }
    
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      status: "cancelled" as const,
      notes: reason ? [...(workOrder.notes || []), reason] : workOrder.notes,
      updatedAt: new Date().toISOString(),
    };
    
    updateWorkOrder(updatedWorkOrder);
    
    return updatedWorkOrder;
  } catch (error) {
    console.error("Error cancelling work order:", error);
    throw error;
  }
};

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
