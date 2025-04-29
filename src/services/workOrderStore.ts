
import { create } from 'zustand';
import { WorkOrder } from '@/types';

interface WorkOrderState {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (workOrder: WorkOrder) => void;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  addWorkOrder: (workOrder) => set((state) => ({
    workOrders: [workOrder, ...state.workOrders]
  })),
  updateWorkOrder: (workOrder) => set((state) => ({
    workOrders: state.workOrders.map((wo) => 
      wo.id === workOrder.id ? workOrder : wo
    )
  })),
  getWorkOrderById: (id) => get().workOrders.find((wo) => wo.id === id)
}));
