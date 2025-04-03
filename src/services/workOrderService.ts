
import { WorkOrder } from "@/types";
import { create } from "zustand";
import { 
  fetchMockWorkOrders, 
  updateMockWorkOrder, 
  completeMockWorkOrder,
  markWorkOrderPendingCompletion,
  createMockWorkOrder
} from "./mockService";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Define the store state type
interface WorkOrderStore {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  updateWorkOrder: (updatedOrder: WorkOrder) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
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
  addWorkOrder: (workOrder) =>
    set((state) => ({
      workOrders: [...state.workOrders, workOrder]
    })),
}));

// Fetch work orders
export const fetchWorkOrders = async () => {
  try {
    // First try to get from Supabase
    let { data, error } = await supabase
      .from('work_orders')
      .select('*');
    
    if (error) {
      console.error("Supabase error:", error);
      // Fall back to mock data
      const orders = await fetchMockWorkOrders();
      useWorkOrderStore.getState().setWorkOrders(orders);
      return orders;
    }
    
    if (data && data.length > 0) {
      // Transform Supabase data to match our WorkOrder interface
      const orders = data.map(transformDbWorkOrder);
      useWorkOrderStore.getState().setWorkOrders(orders);
      return orders;
    } else {
      // No data in Supabase, use mock data
      const orders = await fetchMockWorkOrders();
      useWorkOrderStore.getState().setWorkOrders(orders);
      return orders;
    }
  } catch (error) {
    console.error("Error fetching work orders:", error);
    const orders = await fetchMockWorkOrders();
    useWorkOrderStore.getState().setWorkOrders(orders);
    return orders;
  }
};

// Helper to transform database record to our interface
const transformDbWorkOrder = (dbRecord: any): WorkOrder => {
  return {
    id: dbRecord.id,
    customerId: dbRecord.customer_id,
    customerName: dbRecord.customer_name,
    address: dbRecord.address,
    type: dbRecord.type,
    description: dbRecord.description,
    priority: dbRecord.priority,
    status: dbRecord.status,
    scheduledDate: dbRecord.scheduled_date,
    createdAt: dbRecord.created_at,
    completedDate: dbRecord.completed_date,
    estimatedHours: dbRecord.estimated_hours,
    technicianId: dbRecord.technician_id,
    technicianName: dbRecord.technician_name,
    notes: dbRecord.notes,
    pendingReason: dbRecord.pending_reason,
    completionRequired: dbRecord.completion_required,
    completedAt: dbRecord.completed_at,
    partsUsed: dbRecord.parts_used
  };
};

// Transform our interface to database record
const transformWorkOrderToDb = (workOrder: WorkOrder): any => {
  return {
    id: workOrder.id,
    customer_id: workOrder.customerId,
    customer_name: workOrder.customerName,
    address: workOrder.address,
    type: workOrder.type,
    description: workOrder.description,
    priority: workOrder.priority,
    status: workOrder.status,
    scheduled_date: workOrder.scheduledDate,
    created_at: workOrder.createdAt,
    completed_date: workOrder.completedDate,
    estimated_hours: workOrder.estimatedHours,
    technician_id: workOrder.technicianId,
    technician_name: workOrder.technicianName,
    notes: workOrder.notes,
    pending_reason: workOrder.pendingReason,
    completion_required: workOrder.completionRequired,
    completed_at: workOrder.completedAt,
    parts_used: workOrder.partsUsed
  };
};

// Create work order
export const createWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  try {
    // Generate an ID for the work order if not provided
    const workOrderId = workOrderData.id || `WO${Math.floor(Math.random() * 1000)}`;
    
    // Ensure the work order type is valid
    const type = (workOrderData.type || "maintenance") as "repair" | "maintenance" | "installation" | "inspection";
    const priority = (workOrderData.priority || "medium") as "low" | "medium" | "high" | "emergency";
    
    // Prepare work order data with default values for required fields
    const newWorkOrder: WorkOrder = {
      id: workOrderId,
      customerId: workOrderData.customerId || "",
      customerName: workOrderData.customerName || "",
      address: workOrderData.address || "",
      type: type,
      description: workOrderData.description || "",
      priority: priority,
      status: "pending", // Always create as pending
      scheduledDate: workOrderData.scheduledDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      technicianId: undefined, // Start unassigned
      technicianName: undefined,
      ...workOrderData
    };
    
    // Try to save to Supabase first
    try {
      const dbRecord = transformWorkOrderToDb(newWorkOrder);
      const { error } = await supabase
        .from('work_orders')
        .insert(dbRecord);
      
      if (error) {
        console.error("Error saving to Supabase:", error);
        // Fall back to mock service
        await createMockWorkOrder(newWorkOrder);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Fall back to mock service
      await createMockWorkOrder(newWorkOrder);
    }
    
    // Add to local store
    useWorkOrderStore.getState().addWorkOrder(newWorkOrder);
    return newWorkOrder;
  } catch (error) {
    console.error("Error creating work order:", error);
    throw error;
  }
};

// Update a work order
export const updateWorkOrder = async (workOrder: WorkOrder) => {
  try {
    // Try updating in Supabase first
    try {
      const dbRecord = transformWorkOrderToDb(workOrder);
      const { error } = await supabase
        .from('work_orders')
        .update(dbRecord)
        .eq('id', workOrder.id);
      
      if (error) {
        console.error("Error updating in Supabase:", error);
        // Fall back to mock service
        const updatedOrder = await updateMockWorkOrder(workOrder);
        useWorkOrderStore.getState().updateWorkOrder(updatedOrder);
        return updatedOrder;
      }
    } catch (dbError) {
      console.error("Database update error:", dbError);
      // Fall back to mock service
      const updatedOrder = await updateMockWorkOrder(workOrder);
      useWorkOrderStore.getState().updateWorkOrder(updatedOrder);
      return updatedOrder;
    }
    
    // Update local store
    useWorkOrderStore.getState().updateWorkOrder(workOrder);
    return workOrder;
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
