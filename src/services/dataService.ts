
// Re-export all necessary functions from the dedicated service files
export {
  fetchWorkOrders,
  updateWorkOrder,
  completeWorkOrder,
  cancelWorkOrder,
  assignWorkOrder,
  unassignWorkOrder,
  createWorkOrder,
  createMaintenanceWorkOrder,
  rescheduleMaintenanceWorkOrder,
  markOrderPendingCompletion,
  useWorkOrderStore
} from './workOrderService';

export {
  fetchTechnicians,
  updateTechnician,
  updateTechnicianLocation,
  useTechnicianStore
} from './technicianService';
