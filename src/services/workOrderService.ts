
import { create } from 'zustand';
import { WorkOrder, Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { customers as mockCustomers } from '@/data/mockData';

// Define types for the work order store
interface WorkOrderStore {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  updateWorkOrder: (workOrder: WorkOrder) => void;
  syncWithCustomers: () => void;
}

// Initialize the work order store with Zustand
export const useWorkOrderStore = create<WorkOrderStore>((set, get) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  getWorkOrderById: (id) => get().workOrders.find(order => order.id === id),
  updateWorkOrder: (updatedWorkOrder) => {
    set((state) => ({
      workOrders: state.workOrders.map(order => 
        order.id === updatedWorkOrder.id ? updatedWorkOrder : order
      )
    }));
  },
  syncWithCustomers: () => {
    // This function synchronizes customer information with work orders
    const { workOrders } = get();
    
    // Fetch customers from mock data for now, will be replaced with API call later
    const customers = mockCustomers;
    
    // Map to only include residential customers
    const residentialCustomers = customers.filter(customer => 
      customer.type === 'residential'
    );
    
    // Update work orders with latest customer information
    const updatedWorkOrders = workOrders.map(order => {
      const customer = residentialCustomers.find(c => c.id === order.customerId);
      if (customer) {
        return {
          ...order,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          // Use primary service address or first address in the list
          address: (customer.serviceAddresses && customer.serviceAddresses.length > 0) 
            ? (customer.serviceAddresses.find(a => a.isPrimary)?.address || customer.serviceAddresses[0].address)
            : (customer.serviceAddress || customer.address || ''),
        };
      }
      return order;
    });
    
    set({ workOrders: updatedWorkOrders });
  }
}));

// Function to get work orders from the API
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    // Attempt to fetch from Supabase
    const { data: workOrdersData, error } = await supabase.client
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching work orders from Supabase:", error);
      throw error;
    }
    
    if (!workOrdersData || workOrdersData.length === 0) {
      console.log("No work orders found in database, using mock data");
      // Use mock data filtered to only residential orders
      const residentialMockOrders = getResidentialMockWorkOrders();
      return residentialMockOrders;
    }
    
    // Only return work orders for residential customers
    const residentialWorkOrders = workOrdersData.filter(order => {
      // If we have customer info in the order, check if they're residential
      if (order.customer_type) {
        return order.customer_type === 'residential';
      }
      
      // Otherwise, we'll need to look up the customer
      return true; // We'll filter based on customer lookup later
    });
    
    return residentialWorkOrders as WorkOrder[];
  } catch (error) {
    console.error("Error in getWorkOrders:", error);
    // Fallback to mock data
    const residentialMockOrders = getResidentialMockWorkOrders();
    return residentialMockOrders;
  }
};

// Add alias for getWorkOrders function to match imported names
export const fetchWorkOrders = getWorkOrders;

// Helper function to get mock work orders for residential customers only
const getResidentialMockWorkOrders = (): WorkOrder[] => {
  // Import mock data
  const { workOrders: allMockWorkOrders } = require('@/data/mockData');
  
  // Filter only residential work orders
  const residentialCustomerIds = mockCustomers
    .filter(customer => customer.type === 'residential')
    .map(customer => customer.id);
  
  return allMockWorkOrders.filter((order: WorkOrder) => 
    residentialCustomerIds.includes(order.customerId)
  );
};

// Function to update a work order
export const updateWorkOrder = async (
  workOrderId: string, 
  updates: Partial<WorkOrder>
): Promise<WorkOrder | null> => {
  try {
    const store = useWorkOrderStore.getState();
    const currentOrder = store.getWorkOrderById(workOrderId);
    
    if (!currentOrder) {
      console.error("Work order not found:", workOrderId);
      return null;
    }
    
    // Create the updated order
    const updatedOrder = {
      ...currentOrder,
      ...updates
    };
    
    // Try to update in Supabase
    try {
      const { error } = await supabase.client
        .from('work_orders')
        .update({
          technician_id: updatedOrder.technicianId,
          technician_name: updatedOrder.technicianName,
          status: updatedOrder.status,
          notes: updatedOrder.notes,
          // Add other fields as needed
        })
        .eq('id', workOrderId);
        
      if (error) {
        console.error("Error updating work order in Supabase:", error);
        // Continue with local update even if Supabase fails
      }
    } catch (error) {
      console.error("Failed to update work order in Supabase:", error);
      // Continue with local update even if Supabase fails
    }
    
    // Update in local store
    store.updateWorkOrder(updatedOrder);
    
    return updatedOrder;
  } catch (error) {
    console.error("Error in updateWorkOrder:", error);
    return null;
  }
};

// Function to assign a work order to a technician
export const assignWorkOrder = async (
  workOrderId: string,
  technicianId: string,
  technicianName: string,
  scheduledDate?: string
): Promise<WorkOrder> => {
  try {
    const store = useWorkOrderStore.getState();
    const currentOrder = store.getWorkOrderById(workOrderId);
    
    if (!currentOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }
    
    const updatedOrder: WorkOrder = {
      ...currentOrder,
      technicianId,
      technicianName,
      status: 'scheduled',
      scheduledDate: scheduledDate || currentOrder.scheduledDate
    };
    
    // Try to update in Supabase
    try {
      const { error } = await supabase.client
        .from('work_orders')
        .update({
          technician_id: technicianId,
          technician_name: technicianName,
          status: 'scheduled',
          scheduled_date: scheduledDate || currentOrder.scheduledDate
        })
        .eq('id', workOrderId);
        
      if (error) {
        console.error("Error assigning work order in Supabase:", error);
        // Continue with local update even if Supabase fails
      }
    } catch (error) {
      console.error("Failed to assign work order in Supabase:", error);
      // Continue with local update even if Supabase fails
    }
    
    // Update in local store
    store.updateWorkOrder(updatedOrder);
    
    return updatedOrder;
  } catch (error) {
    console.error("Error in assignWorkOrder:", error);
    throw error;
  }
};

// Function to unassign a work order from a technician
export const unassignWorkOrder = async (workOrderId: string): Promise<WorkOrder> => {
  try {
    const store = useWorkOrderStore.getState();
    const currentOrder = store.getWorkOrderById(workOrderId);
    
    if (!currentOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }
    
    const updatedOrder: WorkOrder = {
      ...currentOrder,
      technicianId: undefined,
      technicianName: undefined,
      status: 'pending'
    };
    
    // Try to update in Supabase
    try {
      const { error } = await supabase.client
        .from('work_orders')
        .update({
          technician_id: null,
          technician_name: null,
          status: 'pending'
        })
        .eq('id', workOrderId);
        
      if (error) {
        console.error("Error unassigning work order in Supabase:", error);
        // Continue with local update even if Supabase fails
      }
    } catch (error) {
      console.error("Failed to unassign work order in Supabase:", error);
      // Continue with local update even if Supabase fails
    }
    
    // Update in local store
    store.updateWorkOrder(updatedOrder);
    
    return updatedOrder;
  } catch (error) {
    console.error("Error in unassignWorkOrder:", error);
    throw error;
  }
};

// Function to create a new work order
export const createWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  try {
    // Generate a unique ID for the new work order
    const newWorkOrder: WorkOrder = {
      id: crypto.randomUUID(),
      customerId: workOrderData.customerId || '',
      customerName: workOrderData.customerName || '',
      address: workOrderData.address || '',
      type: workOrderData.type || 'repair',
      description: workOrderData.description || '',
      priority: workOrderData.priority || 'medium',
      status: workOrderData.status || 'pending',
      scheduledDate: workOrderData.scheduledDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      technicianId: workOrderData.technicianId,
      technicianName: workOrderData.technicianName,
      notes: workOrderData.notes || [],
      // Include other fields from workOrderData
      ...workOrderData
    };
    
    // Try to insert into Supabase
    try {
      const { error } = await supabase.client
        .from('work_orders')
        .insert({
          id: newWorkOrder.id,
          customer_id: newWorkOrder.customerId,
          customer_name: newWorkOrder.customerName,
          address: newWorkOrder.address,
          type: newWorkOrder.type,
          description: newWorkOrder.description,
          priority: newWorkOrder.priority,
          status: newWorkOrder.status,
          scheduled_date: newWorkOrder.scheduledDate,
          technician_id: newWorkOrder.technicianId,
          technician_name: newWorkOrder.technicianName,
          notes: newWorkOrder.notes
        });
        
      if (error) {
        console.error("Error creating work order in Supabase:", error);
        // Continue with local update even if Supabase fails
      }
    } catch (error) {
      console.error("Failed to create work order in Supabase:", error);
      // Continue with local update even if Supabase fails
    }
    
    // Add to local store
    const store = useWorkOrderStore.getState();
    const updatedWorkOrders = [...store.workOrders, newWorkOrder];
    store.setWorkOrders(updatedWorkOrders);
    
    return newWorkOrder;
  } catch (error) {
    console.error("Error in createWorkOrder:", error);
    throw error;
  }
};

// Function for creating maintenance work orders
export const createMaintenanceWorkOrder = async (
  maintenanceItem: any,
  technicianId?: string,
  technicianName?: string,
  scheduledDate?: string
): Promise<WorkOrder> => {
  try {
    const workOrderData: Partial<WorkOrder> = {
      customerName: maintenanceItem.customerName,
      customerId: maintenanceItem.customerId || '',
      address: maintenanceItem.address,
      type: 'maintenance',
      description: `Scheduled HVAC maintenance for ${maintenanceItem.customerName}`,
      priority: 'medium',
      status: technicianId ? 'scheduled' : 'pending',
      scheduledDate: scheduledDate || new Date().toISOString(),
      technicianId,
      technicianName,
      isMaintenancePlan: true,
      maintenanceTimePreference: maintenanceItem.preferredTime
    };
    
    return await createWorkOrder(workOrderData);
  } catch (error) {
    console.error("Error in createMaintenanceWorkOrder:", error);
    throw error;
  }
};

// Function for rescheduling maintenance work orders
export const rescheduleMaintenanceWorkOrder = async (
  workOrderId: string,
  scheduledDate: string
): Promise<WorkOrder | null> => {
  return await updateWorkOrder(workOrderId, {
    scheduledDate,
    status: 'scheduled'
  });
};

// Function to mark a work order as completed
export const completeWorkOrder = async (
  workOrderId: string, 
  notes?: string
): Promise<WorkOrder | null> => {
  try {
    const store = useWorkOrderStore.getState();
    const currentOrder = store.getWorkOrderById(workOrderId);
    
    if (!currentOrder) {
      console.error("Work order not found:", workOrderId);
      return null;
    }
    
    const completedDate = new Date().toISOString();
    const updatedNotes = notes 
      ? [...(currentOrder.notes || []), notes] 
      : currentOrder.notes;
    
    const updates: Partial<WorkOrder> = {
      status: 'completed',
      completedDate,
      notes: updatedNotes,
      completionRequired: false
    };
    
    return await updateWorkOrder(workOrderId, updates);
  } catch (error) {
    console.error("Error in completeWorkOrder:", error);
    return null;
  }
};

// Function to mark a work order as pending completion
export const markOrderPendingCompletion = async (
  workOrderId: string, 
  pendingReason: string
): Promise<WorkOrder | null> => {
  try {
    const store = useWorkOrderStore.getState();
    const currentOrder = store.getWorkOrderById(workOrderId);
    
    if (!currentOrder) {
      console.error("Work order not found:", workOrderId);
      return null;
    }
    
    const updatedNotes = [...(currentOrder.notes || []), `Pending reason: ${pendingReason}`];
    
    const updates: Partial<WorkOrder> = {
      status: 'pending-completion',
      pendingReason,
      notes: updatedNotes,
      completionRequired: true
    };
    
    return await updateWorkOrder(workOrderId, updates);
  } catch (error) {
    console.error("Error in markOrderPendingCompletion:", error);
    return null;
  }
};
