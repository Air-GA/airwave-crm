
import { v4 as uuidv4 } from 'uuid';
import { WorkOrder, Customer } from "@/types";
import { create } from "zustand";
import { supabase } from '@/lib/supabase';
import { 
  fetchMockWorkOrders, 
  createMockWorkOrder, 
  updateMockWorkOrder, 
  completeMockWorkOrder, 
  markWorkOrderPendingCompletion
} from "./mockService";
import { customers as mockCustomers } from "@/data/mockData";

// Store for Work Order state management
interface WorkOrderState {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (workOrder: WorkOrder) => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  addWorkOrder: (workOrder) => set((state) => ({
    workOrders: [...state.workOrders, workOrder]
  })),
  updateWorkOrder: (workOrder) => set((state) => ({
    workOrders: state.workOrders.map(wo => 
      wo.id === workOrder.id ? workOrder : wo
    )
  }))
}));

// Customer store for managing customers
interface CustomerState {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: mockCustomers,
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, customer]
  })),
  updateCustomer: (customer) => set((state) => ({
    customers: state.customers.map(c => 
      c.id === customer.id ? customer : c
    )
  }))
}));

// Fetch work orders from the backend or mock service
export const fetchWorkOrders = async () => {
  try {
    // First try to get from Supabase
    try {
      // Use direct fetch for Supabase API instead of using .from() method
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/work_orders?select=*`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Supabase API returned ${response.status}`);
      }
      
      const data = await response.json();
    
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
      console.error("Database query error:", error);
      const orders = await fetchMockWorkOrders();
      useWorkOrderStore.getState().setWorkOrders(orders);
      return orders;
    }
  } catch (error) {
    console.error("Error fetching work orders:", error);
    // Ensure we always return something
    return [];
  }
};

// Helper function to transform DB record to WorkOrder
const transformDbWorkOrder = (dbRecord: any): WorkOrder => {
  return {
    id: dbRecord.id,
    customerId: dbRecord.customer_id,
    customerName: dbRecord.customer_name,
    address: dbRecord.address,
    type: dbRecord.type as "repair" | "maintenance" | "installation" | "inspection",
    description: dbRecord.description,
    priority: dbRecord.priority as "low" | "medium" | "high" | "emergency",
    status: dbRecord.status as "pending" | "scheduled" | "in-progress" | "completed" | "pending-completion" | "cancelled",
    scheduledDate: dbRecord.scheduled_date,
    createdAt: dbRecord.created_at,
    completedDate: dbRecord.completed_date,
    technicianId: dbRecord.technician_id,
    technicianName: dbRecord.technician_name,
    estimatedHours: dbRecord.estimated_hours,
    notes: dbRecord.notes,
    pendingReason: dbRecord.pending_reason,
    completionRequired: dbRecord.completion_required
  };
};

// Helper function to transform WorkOrder to DB record
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
    technician_id: workOrder.technicianId,
    technician_name: workOrder.technicianName,
    estimated_hours: workOrder.estimatedHours,
    notes: workOrder.notes,
    pending_reason: workOrder.pendingReason,
    completion_required: workOrder.completionRequired
  };
};

// Function to create a new work order
export const createWorkOrder = async (workOrderData: Partial<WorkOrder>): Promise<WorkOrder> => {
  // Generate a UUID for the work order
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  // Create the work order object with defaults
  const newWorkOrder: WorkOrder = {
    id,
    customerId: workOrderData.customerId || "",
    customerName: workOrderData.customerName || "Unknown Customer",
    address: workOrderData.address || "",
    type: workOrderData.type as "repair" | "maintenance" | "installation" | "inspection" || "repair",
    description: workOrderData.description || "",
    priority: workOrderData.priority || "medium",
    status: "pending", // Default to pending
    scheduledDate: workOrderData.scheduledDate || new Date().toISOString(),
    createdAt,
    technicianId: workOrderData.technicianId || "",
    technicianName: workOrderData.technicianName || "",
    estimatedHours: workOrderData.estimatedHours || 1,
    notes: workOrderData.notes || [],
    email: workOrderData.email,
    phoneNumber: workOrderData.phoneNumber,
    completionRequired: workOrderData.completionRequired !== undefined ? workOrderData.completionRequired : true
  };
  
  try {
    // Check if this is a new customer
    const { customers } = useCustomerStore.getState();
    let existingCustomer = customers.find(c => c.id === workOrderData.customerId);
    
    // If customerId exists but we couldn't find the customer, or if no customerId is provided
    // but we have customer information, create a new customer
    if ((!existingCustomer && workOrderData.customerId) || 
        (!workOrderData.customerId && workOrderData.customerName)) {
      
      // Create new customer with data from work order
      const newCustomerId = workOrderData.customerId || uuidv4();
      
      const newCustomer: Customer = {
        id: newCustomerId,
        name: workOrderData.customerName || "Unknown Customer",
        email: workOrderData.email || "",
        phone: workOrderData.phoneNumber || "",
        address: workOrderData.address || "",
        serviceAddress: workOrderData.address || "",
        billAddress: workOrderData.address || "",
        createdAt: createdAt,
        type: "residential" // Default
      };
      
      // Update customerId in the work order
      newWorkOrder.customerId = newCustomerId;
      
      // Add to customer store
      useCustomerStore.getState().addCustomer(newCustomer);
      
      // Try to save to Supabase if possible
      try {
        // Using fetch API instead of supabase.from()
        const customerForDb = supabase.formatCustomerForDb(newCustomer);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/customers`,
          {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(customerForDb)
          }
        );
        
        if (!response.ok) {
          throw new Error(`Supabase API returned ${response.status}`);
        }
      } catch (error) {
        console.error("Error saving new customer to Supabase:", error);
        // Fall back silently - we already saved to local store
      }
    }
    
    // Try to save work order to Supabase first
    try {
      const dbRecord = transformWorkOrderToDb(newWorkOrder);
      
      // Using fetch API instead of supabase.from()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/work_orders`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(dbRecord)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Supabase API returned ${response.status}`);
      }
      
      // Successfully saved to Supabase
      useWorkOrderStore.getState().addWorkOrder(newWorkOrder);
      return newWorkOrder;
    } catch (error) {
      console.error("Supabase error:", error);
      // Fall back to mock service
      const created = await createMockWorkOrder(newWorkOrder);
      useWorkOrderStore.getState().addWorkOrder(created);
      return created;
    }
  } catch (error) {
    console.error("Error creating work order:", error);
    throw new Error("Failed to create work order");
  }
};

// Function to update a work order
export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    // Try to update in Supabase first
    try {
      const dbRecord = transformWorkOrderToDb(workOrder);
      
      // Using fetch API instead of supabase.from()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/work_orders?id=eq.${workOrder.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(dbRecord)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Supabase API returned ${response.status}`);
      }
      
      // Successfully updated in Supabase
      useWorkOrderStore.getState().updateWorkOrder(workOrder);
      return workOrder;
    } catch (error) {
      console.error("Supabase error:", error);
      // Fall back to mock service
      const updated = await updateMockWorkOrder(workOrder);
      useWorkOrderStore.getState().updateWorkOrder(updated);
      return updated;
    }
  } catch (error) {
    console.error("Error updating work order:", error);
    throw new Error("Failed to update work order");
  }
};

// Function to assign a work order to a technician
export const assignWorkOrder = async (
  workOrderId: string,
  technicianId: string,
  technicianName: string,
  scheduledDate: string
): Promise<WorkOrder> => {
  try {
    // Find the work order in the store
    const { workOrders } = useWorkOrderStore.getState();
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    
    if (!workOrder) {
      throw new Error("Work order not found");
    }
    
    // Update the work order
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      technicianId,
      technicianName,
      scheduledDate,
      status: "scheduled"
    };
    
    // Save the updated work order
    return await updateWorkOrder(updatedWorkOrder);
  } catch (error) {
    console.error("Error assigning work order:", error);
    throw new Error("Failed to assign work order");
  }
};

// Function to unassign a work order from a technician
export const unassignWorkOrder = async (workOrderId: string): Promise<WorkOrder> => {
  try {
    // Find the work order in the store
    const { workOrders } = useWorkOrderStore.getState();
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    
    if (!workOrder) {
      throw new Error("Work order not found");
    }
    
    // Update the work order
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      technicianId: "",
      technicianName: "",
      status: "pending"
    };
    
    // Save the updated work order
    return await updateWorkOrder(updatedWorkOrder);
  } catch (error) {
    console.error("Error unassigning work order:", error);
    throw new Error("Failed to unassign work order");
  }
};

// Function to mark a work order as completed
export const completeWorkOrder = async (workOrderId: string, notes?: string): Promise<WorkOrder> => {
  try {
    // Try to complete in mock service first (which handles localStorage)
    const completedWorkOrder = await completeMockWorkOrder(workOrderId, notes);
    useWorkOrderStore.getState().updateWorkOrder(completedWorkOrder);
    return completedWorkOrder;
  } catch (error) {
    console.error("Error completing work order:", error);
    throw new Error("Failed to complete work order");
  }
};

// Function to mark a work order as pending completion
export const markOrderPendingCompletion = async (workOrderId: string, pendingReason: string): Promise<WorkOrder> => {
  try {
    // Try to mark pending in mock service first (which handles localStorage)
    const pendingWorkOrder = await markWorkOrderPendingCompletion(workOrderId, pendingReason);
    useWorkOrderStore.getState().updateWorkOrder(pendingWorkOrder);
    return pendingWorkOrder;
  } catch (error) {
    console.error("Error marking work order as pending completion:", error);
    throw new Error("Failed to mark work order as pending completion");
  }
};
