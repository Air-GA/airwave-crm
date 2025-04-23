
import { Customer, WorkOrder } from "@/types";
import { create } from "zustand";
import { workOrders } from "@/data/mockData"; // Fix: Change from mockWorkOrders to workOrders

// Add status: 'active' to any customer object creation
const createCustomer = (data: any): Customer => {
  return {
    id: data.id || generateId(),
    name: data.name || 'Unknown Customer',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    serviceAddress: data.serviceAddress || data.address || '',
    billAddress: data.billAddress || data.address || '',
    type: 'residential',
    status: 'active', // Add the status field which is required
    createdAt: data.createdAt || new Date().toISOString(),
    serviceAddresses: data.serviceAddresses || [
      { 
        id: `addr-${generateId()}`, 
        address: data.serviceAddress || data.address || '', 
        isPrimary: true 
      }
    ],
  };
};

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// WorkOrder Store using Zustand
interface WorkOrderState {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (workOrder: WorkOrder) => void;
  removeWorkOrder: (workOrderId: string) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  addWorkOrder: (workOrder) => set((state) => ({ 
    workOrders: [...state.workOrders, workOrder] 
  })),
  updateWorkOrder: (workOrder) => set((state) => ({
    workOrders: state.workOrders.map((wo) => 
      wo.id === workOrder.id ? workOrder : wo
    )
  })),
  removeWorkOrder: (workOrderId) => set((state) => ({
    workOrders: state.workOrders.filter((wo) => wo.id !== workOrderId)
  })),
}));

// Fetch work orders (simulating API call)
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  // For now, this will return mock data
  const storedWorkOrders = localStorage.getItem('workOrders');
  
  if (storedWorkOrders) {
    const orders = JSON.parse(storedWorkOrders) as WorkOrder[];
    useWorkOrderStore.getState().setWorkOrders(orders);
    return orders;
  }
  
  // If no stored orders, return mock data
  useWorkOrderStore.getState().setWorkOrders(workOrders);
  return workOrders;
};

// Create a new work order
export const createWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  const newWorkOrder: WorkOrder = {
    id: `wo-${generateId()}`,
    customerId: workOrderData.customerId || '',
    customerName: workOrderData.customerName || 'Unknown Customer',
    email: workOrderData.email || '',
    phoneNumber: workOrderData.phoneNumber || '',
    address: workOrderData.address || '',
    type: workOrderData.type || 'repair',
    description: workOrderData.description || '',
    priority: workOrderData.priority || 'medium',
    status: workOrderData.status || 'pending',
    scheduledDate: workOrderData.scheduledDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    technicianId: workOrderData.technicianId,
    technicianName: workOrderData.technicianName,
    completedDate: workOrderData.completedDate,
    partsUsed: workOrderData.partsUsed || [],
    notes: workOrderData.notes || [],  // Fix: Ensure notes is initialized as an array
    pendingReason: workOrderData.pendingReason,
    isMaintenancePlan: workOrderData.isMaintenancePlan || false
  };

  const workOrders = useWorkOrderStore.getState().workOrders;
  const updatedWorkOrders = [...workOrders, newWorkOrder];
  
  useWorkOrderStore.getState().setWorkOrders(updatedWorkOrders);
  localStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
  
  return newWorkOrder;
};

// Update an existing work order
export const updateWorkOrder = async (
  workOrderId: string, 
  updates: Partial<WorkOrder>
): Promise<WorkOrder | null> => {
  const workOrders = useWorkOrderStore.getState().workOrders;
  const workOrderIndex = workOrders.findIndex((wo) => wo.id === workOrderId);
  
  if (workOrderIndex === -1) return null;
  
  const updatedWorkOrder = {
    ...workOrders[workOrderIndex],
    ...updates,
    // Fix: Ensure notes is always an array
    notes: updates.notes ? (Array.isArray(updates.notes) ? updates.notes : [updates.notes]) : workOrders[workOrderIndex].notes || []
  };
  
  const newWorkOrders = [...workOrders];
  newWorkOrders[workOrderIndex] = updatedWorkOrder;
  
  useWorkOrderStore.getState().setWorkOrders(newWorkOrders);
  localStorage.setItem('workOrders', JSON.stringify(newWorkOrders));
  
  return updatedWorkOrder;
};

// Complete a work order
export const completeWorkOrder = async (
  workOrderId: string,
  notes?: string
): Promise<WorkOrder | null> => {
  return updateWorkOrder(workOrderId, {
    status: 'completed',
    completedDate: new Date().toISOString(),
    notes: notes ? [notes] : []  // Fix: Ensure notes is an array
  });
};

// Mark work order as pending completion
export const markOrderPendingCompletion = async (
  workOrderId: string,
  pendingReason: string
): Promise<WorkOrder | null> => {
  return updateWorkOrder(workOrderId, {
    status: 'pending-completion',
    pendingReason
  });
};

// Assign work order to technician
export const assignWorkOrder = async (
  workOrderId: string,
  technicianId: string,
  technicianName: string,
  scheduledDate?: string  // Add optional scheduledDate parameter
): Promise<WorkOrder | null> => {
  return updateWorkOrder(workOrderId, {
    technicianId,
    technicianName,
    status: 'scheduled',
    scheduledDate: scheduledDate || undefined  // Use scheduledDate if provided
  });
};

// Unassign work order from technician
export const unassignWorkOrder = async (
  workOrderId: string
): Promise<WorkOrder | null> => {
  return updateWorkOrder(workOrderId, {
    technicianId: undefined,
    technicianName: undefined,
    status: 'pending'
  });
};

// Create maintenance work order
export const createMaintenanceWorkOrder = async (
  maintenanceItem: any,
  technicianId?: string,
  technicianName?: string,
  scheduledDate?: string
): Promise<WorkOrder> => {
  return createWorkOrder({
    customerId: maintenanceItem.customerId,
    customerName: maintenanceItem.customerName,
    address: maintenanceItem.address,
    type: 'maintenance',
    description: 'Regular HVAC maintenance service',
    priority: 'medium',
    status: technicianId ? 'scheduled' : 'pending',
    scheduledDate: scheduledDate || new Date().toISOString(),
    technicianId,
    technicianName,
    isMaintenancePlan: true
  });
};

// Reschedule maintenance work order
export const rescheduleMaintenanceWorkOrder = async (
  workOrderId: string,
  newDate: string,
  technicianId?: string,
  technicianName?: string
): Promise<WorkOrder | null> => {
  return updateWorkOrder(workOrderId, {
    scheduledDate: newDate,
    technicianId,
    technicianName,
    status: technicianId ? 'scheduled' : 'pending'
  });
};

export { createCustomer };
