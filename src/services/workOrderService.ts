
import { WorkOrder } from "@/types";
import { create } from "zustand";
import { 
  fetchMockWorkOrders, 
  updateMockWorkOrder, 
  completeMockWorkOrder,
  markWorkOrderPendingCompletion
} from "./mockService";

// Define the store state type
interface WorkOrderStore {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  updateWorkOrder: (updatedOrder: WorkOrder) => void;
}

// Create the store
export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  updateWorkOrder: (updatedOrder) =>
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
    })),
}));

// Fetch work orders
export const fetchWorkOrders = async () => {
  try {
    const orders = await fetchMockWorkOrders();
    useWorkOrderStore.getState().setWorkOrders(orders);
    return orders;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
};

// Update a work order
export const updateWorkOrder = async (workOrder: WorkOrder) => {
  try {
    const updatedOrder = await updateMockWorkOrder(workOrder);
    useWorkOrderStore.getState().updateWorkOrder(updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error("Error updating work order:", error);
    throw error;
  }
};

// Assign work order to technician
export const assignWorkOrder = async (
  workOrderId: string,
  technicianId: string,
  technicianName: string,
  scheduledDate: string
) => {
  const workOrder = useWorkOrderStore.getState().workOrders.find(
    (order) => order.id === workOrderId
  );
  
  if (!workOrder) {
    throw new Error(`Work order with ID ${workOrderId} not found`);
  }
  
  const updatedOrder: WorkOrder = {
    ...workOrder,
    technicianId,
    technicianName,
    scheduledDate,
    status: "scheduled",
    completionRequired: true
  };
  
  return await updateWorkOrder(updatedOrder);
};

// Unassign work order from technician
export const unassignWorkOrder = async (workOrderId: string) => {
  const workOrder = useWorkOrderStore.getState().workOrders.find(
    (order) => order.id === workOrderId
  );
  
  if (!workOrder) {
    throw new Error(`Work order with ID ${workOrderId} not found`);
  }
  
  const updatedOrder: WorkOrder = {
    ...workOrder,
    technicianId: undefined,
    technicianName: undefined,
    status: "pending"
  };
  
  return await updateWorkOrder(updatedOrder);
};

// Complete a work order
export const completeWorkOrder = async (workOrderId: string, notes?: string) => {
  try {
    const completedOrder = await completeMockWorkOrder(workOrderId, notes);
    useWorkOrderStore.getState().updateWorkOrder(completedOrder);
    return completedOrder;
  } catch (error) {
    console.error("Error completing work order:", error);
    throw error;
  }
};

// Mark work order as pending completion with a reason
export const markOrderPendingCompletion = async (workOrderId: string, pendingReason: string) => {
  try {
    const pendingOrder = await markWorkOrderPendingCompletion(workOrderId, pendingReason);
    useWorkOrderStore.getState().updateWorkOrder(pendingOrder);
    return pendingOrder;
  } catch (error) {
    console.error("Error marking work order as pending completion:", error);
    throw error;
  }
};
