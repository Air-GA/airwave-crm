
import { supabase } from '../lib/supabase';
import { WorkOrder } from '../types';
import { create } from 'zustand';

// Sample work order data for development/fallback
const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo1",
    customerId: "cust1",
    customerName: "John Smith",
    address: "123 Main St, Monroe, GA",
    type: "repair",
    description: "AC not cooling properly",
    priority: "high",
    status: "pending",
    scheduledDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "wo2",
    customerId: "cust2",
    customerName: "Emma Johnson",
    address: "456 Oak Ave, Monroe, GA",
    type: "maintenance",
    description: "Annual HVAC maintenance",
    priority: "medium",
    status: "scheduled",
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    technicianId: "tech1",
    technicianName: "Mike Johnson"
  },
  {
    id: "wo3",
    customerId: "cust3",
    customerName: "David Wilson",
    address: "789 Pine Rd, Monroe, GA",
    type: "installation",
    description: "New heat pump installation",
    priority: "low",
    status: "in-progress",
    scheduledDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    technicianId: "tech2",
    technicianName: "Sarah Williams"
  }
];

// Interface for our store
interface WorkOrderStore {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  updateWorkOrder: (updatedWorkOrder: WorkOrder) => void;
  isInitialized: boolean;
}

// Create a Zustand store for work orders
export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders, isInitialized: true }),
  updateWorkOrder: (updatedWorkOrder) => set((state) => ({
    workOrders: state.workOrders.map(order => 
      order.id === updatedWorkOrder.id ? updatedWorkOrder : order
    )
  })),
  isInitialized: false,
}));

// Map the Supabase schema to our application types
const mapWorkOrderFromDB = (order: any): WorkOrder => {
  return {
    id: order.id,
    customerId: order.customer_id,
    customerName: order.customer_name,
    address: order.address,
    type: order.type,
    description: order.description,
    priority: order.priority,
    status: order.status,
    scheduledDate: order.scheduled_date,
    createdAt: order.created_at,
    completedDate: order.completed_date || undefined,
    estimatedHours: order.estimated_hours || undefined,
    technicianId: order.technician_id || undefined,
    technicianName: order.technician_name || undefined,
    notes: order.notes || undefined,
  };
};

// Map our application type to the Supabase schema
const mapWorkOrderToDB = (order: WorkOrder) => {
  return {
    id: order.id,
    customer_id: order.customerId,
    customer_name: order.customerName,
    address: order.address,
    type: order.type,
    description: order.description,
    priority: order.priority,
    status: order.status,
    scheduled_date: order.scheduledDate,
    created_at: order.createdAt,
    completed_date: order.completedDate || null,
    estimated_hours: order.estimatedHours || null,
    technician_id: order.technicianId || null,
    technician_name: order.technicianName || null,
    notes: order.notes || null,
  };
};

export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  const { workOrders, isInitialized } = useWorkOrderStore.getState();
  
  // Return from store if already initialized
  if (isInitialized) {
    return workOrders;
  }
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*');
    
    let resultWorkOrders: WorkOrder[];
    
    if (error) {
      console.warn('Using mock work order data due to Supabase error:', error.message);
      resultWorkOrders = mockWorkOrders;
    } else {
      resultWorkOrders = data.map(mapWorkOrderFromDB);
    }
    
    // Update the store
    useWorkOrderStore.getState().setWorkOrders(resultWorkOrders);
    return resultWorkOrders;
  } catch (error) {
    console.warn('Using mock work order data due to error:', error);
    const resultWorkOrders = mockWorkOrders;
    useWorkOrderStore.getState().setWorkOrders(resultWorkOrders);
    return resultWorkOrders;
  }
};

export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update(mapWorkOrderToDB(workOrder))
      .eq('id', workOrder.id)
      .select()
      .single();
    
    if (error) {
      console.warn('Could not update work order in Supabase:', error.message);
      // Update the store anyway to maintain UI consistency
      useWorkOrderStore.getState().updateWorkOrder(workOrder);
      return workOrder;
    }
    
    const updatedWorkOrder = mapWorkOrderFromDB(data);
    // Update the store
    useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
    return updatedWorkOrder;
  } catch (error) {
    console.warn('Error updating work order:', error);
    // Update the store anyway to maintain UI consistency
    useWorkOrderStore.getState().updateWorkOrder(workOrder);
    return workOrder;
  }
};

export const assignWorkOrder = async (
  workOrderId: string, 
  technicianId: string, 
  technicianName: string, 
  scheduledDate: string
): Promise<WorkOrder> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update({ 
        technician_id: technicianId,
        technician_name: technicianName,
        scheduled_date: scheduledDate,
        status: 'scheduled'
      })
      .eq('id', workOrderId)
      .select()
      .single();
    
    if (error) {
      console.warn('Could not assign work order in Supabase:', error.message);
      // Find the work order and update it in the store
      const { workOrders } = useWorkOrderStore.getState();
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        const updatedWorkOrder = {
          ...workOrder,
          technicianId,
          technicianName,
          scheduledDate,
          status: 'scheduled'
        };
        useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
        return updatedWorkOrder;
      }
      throw new Error('Work order not found');
    }
    
    const updatedWorkOrder = mapWorkOrderFromDB(data);
    // Update the store
    useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
    return updatedWorkOrder;
  } catch (error) {
    console.warn('Error assigning work order:', error);
    // Find the work order and update it in the store
    const { workOrders } = useWorkOrderStore.getState();
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      const updatedWorkOrder = {
        ...workOrder,
        technicianId,
        technicianName,
        scheduledDate,
        status: 'scheduled'
      };
      useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
      return updatedWorkOrder;
    }
    throw new Error('Work order not found');
  }
};

export const unassignWorkOrder = async (workOrderId: string): Promise<WorkOrder> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update({ 
        technician_id: null,
        technician_name: null,
        status: 'pending'
      })
      .eq('id', workOrderId)
      .select()
      .single();
    
    if (error) {
      console.warn('Could not unassign work order in Supabase:', error.message);
      // Find the work order and update it in the store
      const { workOrders } = useWorkOrderStore.getState();
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        const updatedWorkOrder = {
          ...workOrder,
          technicianId: undefined,
          technicianName: undefined,
          status: 'pending'
        };
        useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
        return updatedWorkOrder;
      }
      throw new Error('Work order not found');
    }
    
    const updatedWorkOrder = mapWorkOrderFromDB(data);
    // Update the store
    useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
    return updatedWorkOrder;
  } catch (error) {
    console.warn('Error unassigning work order:', error);
    // Find the work order and update it in the store
    const { workOrders } = useWorkOrderStore.getState();
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      const updatedWorkOrder = {
        ...workOrder,
        technicianId: undefined,
        technicianName: undefined,
        status: 'pending'
      };
      useWorkOrderStore.getState().updateWorkOrder(updatedWorkOrder);
      return updatedWorkOrder;
    }
    throw new Error('Work order not found');
  }
};
