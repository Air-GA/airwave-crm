
import { WorkOrder } from '@/types';
import { updateWorkOrder, cancelWorkOrder, completeWorkOrder } from './workOrderService';

/**
 * Creates a new work order
 */
export const createWorkOrder = async (workOrder: Partial<WorkOrder>): Promise<WorkOrder> => {
  console.log('Creating work order', workOrder);
  // In a real app, we would make an API call here
  const newWorkOrder: WorkOrder = {
    id: `wo-${Date.now()}`,
    customerId: workOrder.customerId || '',
    customerName: workOrder.customerName || 'Unknown Customer',
    address: workOrder.address || 'No Address',
    status: workOrder.status || 'pending',
    priority: workOrder.priority || 'medium',
    type: workOrder.type || 'repair',
    description: workOrder.description || '',
    scheduledDate: workOrder.scheduledDate || new Date().toISOString(),
    technicianId: workOrder.technicianId,
    technicianName: workOrder.technicianName,
    createdAt: workOrder.createdAt || new Date().toISOString(),
    completedDate: workOrder.completedDate,
    estimatedHours: workOrder.estimatedHours || 1,
    notes: workOrder.notes || [],
    partsUsed: workOrder.partsUsed || [],
    progressPercentage: workOrder.progressPercentage || 0,
    progressSteps: workOrder.progressSteps || [],
    isMaintenancePlan: workOrder.isMaintenancePlan || false,
    completionRequired: workOrder.completionRequired || true,
    email: workOrder.email,
    phoneNumber: workOrder.phoneNumber
  };
  return newWorkOrder;
};

/**
 * Creates a new maintenance work order
 */
export const createMaintenanceWorkOrder = async (
  workOrderData: any,
  technicianId?: string,
  technicianName?: string,
  scheduledDate?: string
): Promise<WorkOrder> => {
  console.log('Creating maintenance work order', workOrderData);
  const maintenanceWorkOrder: Partial<WorkOrder> = {
    ...workOrderData,
    isMaintenancePlan: true,
    type: 'maintenance',
    technicianId,
    technicianName,
    scheduledDate: scheduledDate || new Date().toISOString()
  };
  return createWorkOrder(maintenanceWorkOrder);
};

/**
 * Reschedules a maintenance work order
 */
export const rescheduleMaintenanceWorkOrder = async (
  workOrderId: string, 
  newDate: string
): Promise<boolean> => {
  console.log(`Rescheduling maintenance work order ${workOrderId} to ${newDate}`);
  return true;
};

/**
 * Assigns a technician to a work order
 */
export const assignWorkOrder = async (
  workOrderId: string, 
  technicianId: string
): Promise<boolean> => {
  console.log(`Assigning technician ${technicianId} to work order ${workOrderId}`);
  return true;
};

/**
 * Unassigns a technician from a work order
 */
export const unassignWorkOrder = async (workOrderId: string): Promise<boolean> => {
  console.log(`Unassigning technician from work order ${workOrderId}`);
  return true;
};

/**
 * Marks a work order as pending completion
 */
export const markOrderPendingCompletion = async (
  workOrderId: string,
  notes?: string
): Promise<boolean> => {
  console.log(`Marking work order ${workOrderId} as pending completion`);
  if (notes) {
    console.log(`Notes: ${notes}`);
  }
  return true;
};
