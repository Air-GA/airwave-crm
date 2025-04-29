
import { resetCache } from "./cacheService";
export { fetchWorkOrders, updateWorkOrder, assignTechnician, completeWorkOrder, cancelWorkOrder } from "./workOrderService";
export { fetchTechnicians } from "./technicianService";
export { useWorkOrderStore } from "./workOrderStore";
export { useTechnicianStore } from "./technicianStore";
export { 
  createWorkOrder, 
  createMaintenanceWorkOrder, 
  rescheduleMaintenanceWorkOrder,
  assignWorkOrder,
  unassignWorkOrder,
  markOrderPendingCompletion
} from "./workOrderUtils";

export const refreshAllData = () => {
  resetCache();
};
