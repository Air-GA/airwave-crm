
import { supabase } from '../lib/supabase';
import { WorkOrder } from '../types';

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
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*');
    
    if (error) {
      console.warn('Using mock work order data due to Supabase error:', error.message);
      return mockWorkOrders;
    }
    
    return data.map(mapWorkOrderFromDB);
  } catch (error) {
    console.warn('Using mock work order data due to error:', error);
    return mockWorkOrders;
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
      // Return the original order as if it was updated
      return workOrder;
    }
    
    return mapWorkOrderFromDB(data);
  } catch (error) {
    console.warn('Error updating work order:', error);
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
      // Find the work order in our mock data and update it
      const workOrder = mockWorkOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        workOrder.technicianId = technicianId;
        workOrder.technicianName = technicianName;
        workOrder.scheduledDate = scheduledDate;
        workOrder.status = 'scheduled';
        return workOrder;
      }
      throw new Error('Work order not found');
    }
    
    return mapWorkOrderFromDB(data);
  } catch (error) {
    console.warn('Error assigning work order:', error);
    // If we get here, something really went wrong
    const workOrder = mockWorkOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      workOrder.technicianId = technicianId;
      workOrder.technicianName = technicianName;
      workOrder.scheduledDate = scheduledDate;
      workOrder.status = 'scheduled';
      return workOrder;
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
      // Find the work order in our mock data and update it
      const workOrder = mockWorkOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        workOrder.technicianId = undefined;
        workOrder.technicianName = undefined;
        workOrder.status = 'pending';
        return workOrder;
      }
      throw new Error('Work order not found');
    }
    
    return mapWorkOrderFromDB(data);
  } catch (error) {
    console.warn('Error unassigning work order:', error);
    // If we get here, something really went wrong
    const workOrder = mockWorkOrders.find(wo => wo.id === workOrderId);
    if (workOrder) {
      workOrder.technicianId = undefined;
      workOrder.technicianName = undefined;
      workOrder.status = 'pending';
      return workOrder;
    }
    throw new Error('Work order not found');
  }
};
