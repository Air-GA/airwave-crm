
import { WorkOrder } from "@/types";
import { create } from "zustand";
import { fetchMockWorkOrders, updateMockWorkOrder } from "./mockService";

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
