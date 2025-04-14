import { WorkOrder, Customer, ProgressStep } from '@/types';
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
  addWorkOrder: (newOrder: WorkOrder) => void;
  removeWorkOrder: (orderId: string) => void;
}

export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  updateWorkOrder: (updatedOrder) => set((state) => ({
    workOrders: state.workOrders.map((order) => 
      order.id === updatedOrder.id ? updatedOrder : order
    ),
  })),
  addWorkOrder: (newOrder) => set((state) => ({
    workOrders: [newOrder, ...state.workOrders]
  })),
  removeWorkOrder: (orderId) => set((state) => ({
    workOrders: state.workOrders.filter((order) => order.id !== orderId)
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
      // Filter out commercial jobs and only include residential
      const filteredData = data.filter(order => {
        // If we have customer data, check if they're residential
        // Otherwise include them and we'll filter properly in the UI
        const customerType = order.customer_type || 'residential';
        return customerType !== 'commercial';
      });
      
      return filteredData.map((order: any) => ({
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
  const storedWorkOrders = JSON.parse(localStorage.getItem('workOrders') || JSON.stringify(mockWorkOrders));
  
  // Filter out commercial jobs from mock/localStorage data
  return storedWorkOrders.filter((order: WorkOrder) => {
    // If we don't have explicit customer type info, assume residential
    return true; // We'll handle filtering in the UI components
  });
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
    notes: workOrder.notes || [],
    isMaintenancePlan: workOrder.isMaintenancePlan || false,
    maintenanceTimePreference: workOrder.maintenanceTimePreference,
    estimatedHours: workOrder.estimatedHours,
    email: workOrder.email,
    phoneNumber: workOrder.phoneNumber
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
        notes: newWorkOrder.notes,
        is_maintenance_plan: newWorkOrder.isMaintenancePlan,
        maintenance_time_preference: newWorkOrder.maintenanceTimePreference,
        estimated_hours: newWorkOrder.estimatedHours,
        customer_type: 'residential'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      const mappedOrder = {
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
        notes: data.notes,
        isMaintenancePlan: data.is_maintenance_plan,
        maintenanceTimePreference: data.maintenance_time_preference,
        estimatedHours: data.estimated_hours
      };
      
      // Update the store
      useWorkOrderStore.getState().addWorkOrder(mappedOrder);
      
      return mappedOrder;
    }
  } catch (err) {
    console.error("Error creating work order:", err);
  }
  
  // Fall back to localStorage
  const existingWorkOrders = JSON.parse(localStorage.getItem('workOrders') || JSON.stringify(mockWorkOrders));
  localStorage.setItem('workOrders', JSON.stringify([newWorkOrder, ...existingWorkOrders]));
  
  // Update the store
  useWorkOrderStore.getState().addWorkOrder(newWorkOrder);
  
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
        completedDate: data.completed_at,
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

/**
 * Create a maintenance plan work order
 * @param maintenanceItem The maintenance item to schedule
 * @param technicianId The ID of the technician to assign
 * @param technicianName The name of the technician
 * @param scheduledDate The date and time for the maintenance
 * @returns The created work order
 */
export async function createMaintenanceWorkOrder(
  maintenanceItem: any,
  technicianId: string | undefined,
  technicianName: string | undefined,
  scheduledDate: string
): Promise<WorkOrder> {
  const workOrder = await createWorkOrder({
    customerId: maintenanceItem.customerId,
    customerName: maintenanceItem.customerName,
    address: maintenanceItem.address,
    type: 'maintenance',
    description: 'Biannual HVAC maintenance service',
    priority: 'medium',
    status: technicianId ? 'scheduled' : 'pending',
    scheduledDate: scheduledDate,
    technicianId: technicianId,
    technicianName: technicianName,
    isMaintenancePlan: true,
    maintenanceTimePreference: maintenanceItem.preferredTime,
    estimatedHours: 3 // 3 hours for HVAC maintenance
  });
  
  return workOrder;
}

/**
 * Reschedule a maintenance work order
 * @param workOrderId The ID of the work order to reschedule
 * @param technicianId The ID of the technician
 * @param technicianName The name of the technician
 * @param scheduledDate The new scheduled date and time
 * @returns The updated work order
 */
export async function rescheduleMaintenanceWorkOrder(
  workOrderId: string,
  technicianId: string | undefined,
  technicianName: string | undefined,
  scheduledDate: string
): Promise<WorkOrder | null> {
  const updatedOrder = await updateWorkOrder(workOrderId, {
    technicianId,
    technicianName,
    scheduledDate,
    status: technicianId ? 'scheduled' : 'pending'
  });
  
  if (!updatedOrder) {
    throw new Error(`Failed to reschedule maintenance work order ${workOrderId}`);
  }
  
  // Update the store
  useWorkOrderStore.getState().updateWorkOrder(updatedOrder);
  
  return updatedOrder;
}

export async function updateWorkOrderProgress(
  workOrderId: string,
  progressSteps: ProgressStep[],
  currentStep: string,
  progressPercentage: number
): Promise<WorkOrder | null> {
  try {
    // Format for database
    const progressData = {
      progress_steps: progressSteps,
      current_progress_step: currentStep,
      progress_percentage: progressPercentage
    };
    
    // Try to update in Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .update(progressData)
      .eq('id', workOrderId)
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      const updatedOrder = {
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
        progressSteps: data.progress_steps,
        currentProgressStep: data.current_progress_step,
        progressPercentage: data.progress_percentage,
        partsUsed: data.parts_used
      };
      
      // Update the store
      const store = useWorkOrderStore.getState();
      store.updateWorkOrder(updatedOrder);
      
      return updatedOrder;
    }
  } catch (err) {
    console.error("Error updating work order progress in database:", err);
  }
  
  // Fall back to localStorage if Supabase update fails
  try {
    const existingWorkOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    const updatedWorkOrders = existingWorkOrders.map((order: WorkOrder) => {
      if (order.id === workOrderId) {
        return { 
          ...order, 
          progressSteps,
          currentProgressStep: currentStep,
          progressPercentage
        };
      }
      return order;
    });
    
    localStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
    
    const updatedOrder = updatedWorkOrders.find((order: WorkOrder) => order.id === workOrderId);
    if (updatedOrder) {
      // Update the store
      const store = useWorkOrderStore.getState();
      store.updateWorkOrder(updatedOrder);
      
      return updatedOrder;
    }
  } catch (err) {
    console.error("Error updating work order progress in localStorage:", err);
  }
  
  return null;
}

/**
 * Update work order with additional timeline events
 */
export async function updateWorkOrderTimeline(
  workOrderId: string,
  eventType: 'tech_assigned' | 'reminder_sent' | 'supplies_loaded' | 'tech_dispatched' | 'tech_arrived',
  eventData?: any
): Promise<WorkOrder | null> {
  try {
    const workOrder = await getWorkOrderById(workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }
    
    const updates: Partial<WorkOrder> = {};
    const timestamp = new Date().toISOString();
    
    // Update appropriate fields based on event type
    switch (eventType) {
      case 'tech_assigned':
        updates.technicianId = eventData?.technicianId;
        updates.technicianName = eventData?.technicianName;
        updates.status = 'scheduled';
        break;
      case 'reminder_sent':
        updates.reminderSentTime = timestamp;
        break;
      case 'supplies_loaded':
        updates.suppliesLoadedTime = timestamp;
        break;
      case 'tech_dispatched':
        updates.techDispatchTime = timestamp;
        updates.status = 'in-progress';
        break;
      case 'tech_arrived':
        updates.estimatedArrivalTime = timestamp;
        break;
    }
    
    // Update progress steps if they exist
    if (workOrder.progressSteps) {
      const progressSteps = [...workOrder.progressSteps];
      let stepUpdated = false;
      
      // Map event types to progress step IDs
      const eventStepMap: Record<string, string> = {
        tech_assigned: 'assignment',
        reminder_sent: 'reminder',
        supplies_loaded: 'supplies',
        tech_dispatched: 'enroute',
        tech_arrived: 'arrival'
      };
      
      const stepId = eventStepMap[eventType];
      if (stepId) {
        const stepIndex = progressSteps.findIndex(step => step.id === stepId);
        if (stepIndex !== -1) {
          progressSteps[stepIndex] = {
            ...progressSteps[stepIndex],
            status: 'completed',
            timestamp
          };
          stepUpdated = true;
        }
      }
      
      if (stepUpdated) {
        // Find the next pending step
        const nextPendingStep = progressSteps.find(
          step => step.status === 'pending'
        );
        
        updates.progressSteps = progressSteps;
        updates.currentProgressStep = nextPendingStep?.id || progressSteps[progressSteps.length - 1].id;
        updates.progressPercentage = Math.round(
          (progressSteps.filter(step => step.status === 'completed').length / progressSteps.length) * 100
        );
      }
    }
    
    return await updateWorkOrder(workOrderId, updates);
  } catch (error) {
    console.error("Error updating work order timeline:", error);
    return null;
  }
}

/**
 * Get a single work order by ID
 */
export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder | null> {
  try {
    // Try to get from Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
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
        progressSteps: data.progress_steps,
        currentProgressStep: data.current_progress_step,
        progressPercentage: data.progress_percentage,
        partsUsed: data.parts_used
      };
    }
  } catch (err) {
    console.error("Error fetching work order from database:", err);
  }
  
  // Fall back to localStorage
  try {
    const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    return workOrders.find((order: WorkOrder) => order.id === workOrderId) || null;
  } catch (err) {
    console.error("Error fetching work order from localStorage:", err);
    return null;
  }
}
