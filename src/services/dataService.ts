
import { resetCache } from "./cacheService";
export { fetchWorkOrders, updateWorkOrder, assignTechnician, completeWorkOrder, cancelWorkOrder } from "./workOrderService";
export { fetchTechnicians } from "./technicianService";

export const refreshAllData = () => {
  resetCache();
};
