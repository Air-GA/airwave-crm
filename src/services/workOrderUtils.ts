
import { WorkOrder } from "@/types";
import { useWorkOrderStore } from "@/services/workOrderStore";
import { v4 as uuidv4 } from "uuid";

// Create a new work order
export const createWorkOrder = async (
  workOrderData: Omit<WorkOrder, "id" | "createdAt" | "updatedAt">
): Promise<WorkOrder> => {
  try {
    const newWorkOrder: WorkOrder = {
      id: uuidv4(),
      ...workOrderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real app, this would be an API call
    // For now, add it to the store
    useWorkOrderStore.getState().addWorkOrder(newWorkOrder);

    return newWorkOrder;
  } catch (error) {
    console.error("Error creating work order:", error);
    throw error;
  }
};

// Create a maintenance work order from a maintenance plan
export const createMaintenanceWorkOrder = async (
  maintenancePlan: any,
  technicianId?: string,
  technicianName?: string,
  scheduledDate?: string
): Promise<WorkOrder> => {
  try {
    // Extract the base data from the maintenance plan
    const baseData: Omit<WorkOrder, "id" | "createdAt" | "updatedAt"> = {
      customerName: maintenancePlan.customerName,
      customerId: maintenancePlan.customerId,
      address: maintenancePlan.address,
      type: "maintenance", 
      description: "Scheduled HVAC maintenance",
      priority: "medium",
      notes: [],
      status: technicianId ? "scheduled" : "pending",
      maintenancePlanId: maintenancePlan.id,
      isMaintenancePlan: false,
      scheduledDate: scheduledDate || new Date().toISOString(),
      technicianId,
      technicianName,
      completionDetails: null
    };

    const workOrder = await createWorkOrder(baseData);

    // Mark the maintenance plan as scheduled
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const plan = workOrders.find(
      (order) => order.id === maintenancePlan.id && order.isMaintenancePlan
    );

    if (plan) {
      updateWorkOrder({
        ...plan,
        scheduledDate: scheduledDate || new Date().toISOString(),
      });
    }

    return workOrder;
  } catch (error) {
    console.error("Error creating maintenance work order:", error);
    throw error;
  }
};

// Reschedule a maintenance work order
export const rescheduleMaintenanceWorkOrder = async (
  maintenanceOrderId: string,
  scheduledDate: string
): Promise<WorkOrder | null> => {
  try {
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === maintenanceOrderId);

    if (!workOrder) {
      return null;
    }

    const updatedWorkOrder = {
      ...workOrder,
      scheduledDate,
      updatedAt: new Date().toISOString(),
    };

    updateWorkOrder(updatedWorkOrder);

    return updatedWorkOrder;
  } catch (error) {
    console.error("Error rescheduling maintenance work order:", error);
    throw error;
  }
};

// Assign a work order to a technician
export const assignWorkOrder = async (
  workOrderId: string,
  technicianId: string,
  technicianName: string
): Promise<WorkOrder | null> => {
  try {
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === workOrderId);

    if (!workOrder) {
      return null;
    }

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      technicianId,
      technicianName,
      status: "scheduled",
      updatedAt: new Date().toISOString(),
    };

    updateWorkOrder(updatedWorkOrder);

    return updatedWorkOrder;
  } catch (error) {
    console.error("Error assigning work order:", error);
    throw error;
  }
};

// Unassign a work order from a technician
export const unassignWorkOrder = async (
  workOrderId: string
): Promise<WorkOrder | null> => {
  try {
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === workOrderId);

    if (!workOrder) {
      return null;
    }

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      technicianId: undefined,
      technicianName: undefined,
      status: "pending",
      updatedAt: new Date().toISOString(),
    };

    updateWorkOrder(updatedWorkOrder);

    return updatedWorkOrder;
  } catch (error) {
    console.error("Error unassigning work order:", error);
    throw error;
  }
};

// Mark a work order as pending completion
export const markOrderPendingCompletion = async (
  workOrderId: string
): Promise<WorkOrder | null> => {
  try {
    const { workOrders, updateWorkOrder } = useWorkOrderStore.getState();
    const workOrder = workOrders.find((order) => order.id === workOrderId);

    if (!workOrder) {
      return null;
    }

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      status: "pending-completion",
      updatedAt: new Date().toISOString(),
    };

    updateWorkOrder(updatedWorkOrder);

    return updatedWorkOrder;
  } catch (error) {
    console.error("Error marking work order as pending completion:", error);
    throw error;
  }
};
