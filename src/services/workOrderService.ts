
import { supabase } from '../lib/supabase';
import { WorkOrder } from '../types';

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
  const { data, error } = await supabase
    .from('work_orders')
    .select('*');
  
  if (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
  
  return data.map(mapWorkOrderFromDB);
};

export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  const { data, error } = await supabase
    .from('work_orders')
    .update(mapWorkOrderToDB(workOrder))
    .eq('id', workOrder.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating work order:', error);
    throw error;
  }
  
  return mapWorkOrderFromDB(data);
};

export const assignWorkOrder = async (
  workOrderId: string, 
  technicianId: string, 
  technicianName: string, 
  scheduledDate: string
): Promise<WorkOrder> => {
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
    console.error('Error assigning work order:', error);
    throw error;
  }
  
  return mapWorkOrderFromDB(data);
};

export const unassignWorkOrder = async (workOrderId: string): Promise<WorkOrder> => {
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
    console.error('Error unassigning work order:', error);
    throw error;
  }
  
  return mapWorkOrderFromDB(data);
};
