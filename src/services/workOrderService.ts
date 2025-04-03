import { WorkOrder, Customer } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { customers as mockCustomers, workOrders as mockWorkOrders } from '@/data/mockData';
import { completeMockWorkOrder, markWorkOrderPendingCompletion } from './mockService';
import { create } from 'zustand';

// Create a work order store for state management
interface WorkOrderStore {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  updateWorkOrder: (updatedOrder: WorkOrder) => void;
}

export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  updateWorkOrder: (updatedOrder) => set((state) => ({
    workOrders: state.workOrders.map((order) => 
      order.id === updatedOrder.id ? updatedOrder : order
    ),
  })),
}));

// Function to create a customer from work order data
export async function createCustomerFromWorkOrder(workOrder: Partial<WorkOrder>): Promise<Customer> {
  if (!workOrder.customerName || !workOrder.address) {
    throw new Error("Customer name and address are required");
  }
  
  // Create a new customer with work order details
  const newCustomer: Customer = {
    id: uuidv4(),
    name: workOrder.customerName,
    email: workOrder.email || '',
    phone: workOrder.phoneNumber || '',
    address: workOrder.address,
    serviceAddress: workOrder.address,
    billAddress: workOrder.address,
    type: 'residential',
    createdAt: new Date().toISOString(),
    serviceAddresses: [
      {
        id: uuidv4(),
        address: workOrder.address,
        isPrimary: true
      }
    ]
  };
  
  try {
    // Try to save to Supabase if available
    const { data, error } = await supabase
      .from('customers')
      .insert(supabase.formatCustomerForDb(newCustomer))
      .select()
      .single();
    
    if (error) {
      console.error("Error saving customer to database:", error);
      // Fall back to local storage
      const existingCustomers = JSON.parse(localStorage.getItem('customers') || JSON.stringify(mockCustomers));
      localStorage.setItem('customers', JSON.stringify([newCustomer, ...existingCustomers]));
    }
  } catch (err) {
    console.error("Error in customer creation:", err);
    // Fall back to local storage
    const existingCustomers = JSON.parse(localStorage.getItem('customers') || JSON.stringify(mockCustomers));
    localStorage.setItem('customers', JSON.stringify([newCustomer, ...existingCustomers]));
  }
  
  return newCustomer;
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        customerName: order.customer_name,
        address: order.address,
        status: order.status,
        priority: order.priority,
        type: order.type,
        description: order.description,
        scheduledDate: order.scheduled_date,
        technicianId: order.technician_id,
        technicianName: order.technician_name,
        createdAt: order.created_at,
        completedAt: order.completed_at,
        notes: order.notes,
        partsUsed: order.parts_used
      }));
    }
  } catch (err) {
    console.error("Error fetching work orders:", err);
  }
  
  // Fall back to mock data or localStorage
  return JSON.parse(localStorage.getItem('workOrders') || JSON.stringify(mockWorkOrders));
}

export const fetchWorkOrders = getWorkOrders;

export async function createWorkOrder(workOrder: Partial<WorkOrder>): Promise<WorkOrder> {
  const newWorkOrder: WorkOrder = {
    id: uuidv4(),
    customerId: workOrder.customerId || '',
    customerName: workOrder.customerName || '',
    address: workOrder.address || '',
    status: workOrder.status || 'pending',
    priority: workOrder.priority || 'medium',
    type: workOrder.type || 'repair',
    description: workOrder.description || '',
    scheduledDate: workOrder.scheduledDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    technicianId: workOrder.technicianId,
    technicianName: workOrder.technicianName,
    notes: workOrder.notes || []
  };
  
  try {
    // Try to save to Supabase if available
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        id: newWorkOrder.id,
        customer_id: newWorkOrder.customerId,
        customer_name: newWorkOrder.customerName,
        address: newWorkOrder.address,
        status: newWorkOrder.status,
        priority: newWorkOrder.priority,
        type: newWorkOrder.type,
        description: newWorkOrder.description,
        scheduled_date: newWorkOrder.scheduledDate,
        technician_id: newWorkOrder.technicianId,
        technician_name: newWorkOrder.technicianName,
        created_at: newWorkOrder.createdAt,
        notes: newWorkOrder.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        address: data.address,
        status: data.status,
        priority: data.priority,
        type: data.type,
        description: data.description,
        scheduledDate: data.scheduled_date,
        technicianId: data.technician_id,
        technicianName: data.technician_name,
        createdAt: data.created_at,
        notes: data.notes
      };
    }
  } catch (err) {
    console.error("Error creating work order:", err);
  }
  
  // Fall back to localStorage
  const existingWorkOrders = JSON.parse(localStorage.getItem('workOrders') || JSON.stringify(mockWorkOrders));
  localStorage.setItem('workOrders', JSON.stringify([newWorkOrder, ...existingWorkOrders]));
  
  return newWorkOrder;
}

export async function updateWorkOrder(workOrderId: string, updates: Partial<WorkOrder>): Promise<WorkOrder | null> {
  try {
    // Format the data for the database
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
    if (updates.technicianId !== undefined) dbUpdates.technician_id = updates.technicianId;
    if (updates.technicianName !== undefined) dbUpdates.technician_name = updates.technicianName;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.partsUsed !== undefined) dbUpdates.parts_used = updates.partsUsed;
    
    // Try to update in Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .update(dbUpdates)
      .eq('id', workOrderId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        address: data.address,
        status: data.status,
        priority: data.priority,
        type: data.type,
        description: data.description,
        scheduledDate: data.scheduled_date,
        technicianId: data.technician_id,
        technicianName: data.technician_name,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        notes: data.notes,
        partsUsed: data.parts_used
      };
    }
  } catch (err) {
    console.error("Error updating work order in database:", err);
  }
  
  // Fall back to localStorage
  try {
    const existingWorkOrders = JSON.parse(localStorage.getItem('workOrders') || JSON.stringify(mockWorkOrders));
    const updatedWorkOrders = existingWorkOrders.map((order: WorkOrder) => {
      if (order.id === workOrderId) {
        return { ...order, ...updates };
      }
      return order;
    });
    
    localStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
    return updatedWorkOrders.find((order: WorkOrder) => order.id === workOrderId) || null;
  } catch (err) {
    console.error("Error updating work order in localStorage:", err);
    return null;
  }
}

export async function deleteWorkOrder(workOrderId: string): Promise<boolean> {
  try {
    // Try to delete from Supabase
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', workOrderId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting work order from database:", err);
    
    // Fall back to localStorage
    try {
      const existingWorkOrders = JSON.parse(localStorage.getItem('workOrders') || JSON.stringify(mockWorkOrders));
      const filteredWorkOrders = existingWorkOrders.filter((order: WorkOrder) => order.id !== workOrderId);
      localStorage.setItem('workOrders', JSON.stringify(filteredWorkOrders));
      return true;
    } catch (err) {
      console.error("Error deleting work order from localStorage:", err);
      return false;
    }
  }
}

// New functions for work order completion

/**
 * Complete a work order
 * @param workOrderId The ID of the work order to complete
 * @param completionNotes Optional notes about the completion
 * @returns The updated work order
 */
export async function completeWorkOrder(workOrderId: string, completionNotes?: string): Promise<WorkOrder | null> {
  try {
    // Try to update in Supabase first
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: supabase.client.rpc('array_append_note', { 
          work_order_id: workOrderId,
          new_note: completionNotes
        })
      })
      .eq('id', workOrderId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        address: data.address,
        status: data.status,
        priority: data.priority,
        type: data.type,
        description: data.description,
        scheduledDate: data.scheduled_date,
        technicianId: data.technician_id,
        technicianName: data.technician_name,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        completedDate: data.completed_at, // Add for compatibility
        notes: data.notes,
        partsUsed: data.parts_used
      };
    }
  } catch (err) {
    console.error("Error completing work order in database:", err);
  }
  
  // Fall back to mock service
  try {
    const updatedOrder = await completeMockWorkOrder(workOrderId, completionNotes);
    return updatedOrder;
  } catch (err) {
    console.error("Error completing work order in mock service:", err);
    return null;
  }
}

/**
 * Mark a work order as pending completion
 * @param workOrderId The ID of the work order
 * @param pendingReason The reason why the work order is pending completion
 * @returns The updated work order
 */
export async function markOrderPendingCompletion(workOrderId: string, pendingReason: string): Promise<WorkOrder | null> {
  try {
    // Try to update in Supabase first
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        status: 'pending-completion',
        pending_reason: pendingReason
      })
      .eq('id', workOrderId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        address: data.address,
        status: data.status,
        priority: data.priority,
        type: data.type,
        description: data.description,
        scheduledDate: data.scheduled_date,
        technicianId: data.technician_id,
        technicianName: data.technician_name,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        notes: data.notes,
        pendingReason: data.pending_reason,
        partsUsed: data.parts_used
      };
    }
  } catch (err) {
    console.error("Error marking work order as pending completion in database:", err);
  }
  
  // Fall back to mock service
  try {
    const updatedOrder = await markWorkOrderPendingCompletion(workOrderId, pendingReason);
    return updatedOrder;
  } catch (err) {
    console.error("Error marking work order as pending completion in mock service:", err);
    return null;
  }
}

/**
 * Assign a work order to a technician
 * @param workOrderId The ID of the work order
 * @param technicianId The ID of the technician
 * @param technicianName The name of the technician
 * @param scheduledDate The date the work order is scheduled for
 * @returns The updated work order
 */
export async function assignWorkOrder(
  workOrderId: string, 
  technicianId: string, 
  technicianName: string, 
  scheduledDate: string
): Promise<WorkOrder> {
  const updatedOrder = await updateWorkOrder(workOrderId, {
    technicianId,
    technicianName,
    scheduledDate,
    status: 'scheduled'
  });
  
  if (!updatedOrder) {
    throw new Error(`Failed to assign work order ${workOrderId} to technician ${technicianId}`);
  }
  
  // Update the store
  const store = useWorkOrderStore.getState();
  store.updateWorkOrder(updatedOrder);
  
  return updatedOrder;
}

/**
 * Unassign a work order from a technician
 * @param workOrderId The ID of the work order
 * @returns The updated work order
 */
export async function unassignWorkOrder(workOrderId: string): Promise<WorkOrder> {
  const updatedOrder = await updateWorkOrder(workOrderId, {
    technicianId: undefined,
    technicianName: undefined,
    status: 'pending'
  });
  
  if (!updatedOrder) {
    throw new Error(`Failed to unassign work order ${workOrderId}`);
  }
  
  // Update the store
  const store = useWorkOrderStore.getState();
  store.updateWorkOrder(updatedOrder);
  
  return updatedOrder;
}
