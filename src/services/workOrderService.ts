import { create } from 'zustand';
import { WorkOrder, Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { customers as mockCustomers } from '@/data/mockData';

// Define types for the work order store
interface WorkOrderStore {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  updateWorkOrder: (workOrder: WorkOrder) => void;
  syncWithCustomers: () => void;
}

// Initialize the work order store with Zustand
export const useWorkOrderStore = create<WorkOrderStore>((set, get) => ({
  workOrders: [],
  setWorkOrders: (workOrders) => set({ workOrders }),
  getWorkOrderById: (id) => get().workOrders.find(order => order.id === id),
  updateWorkOrder: (updatedWorkOrder) => {
    set((state) => ({
      workOrders: state.workOrders.map(order => 
        order.id === updatedWorkOrder.id ? updatedWorkOrder : order
      )
    }));
  },
  syncWithCustomers: () => {
    // This function synchronizes customer information with work orders
    const { workOrders } = get();
    
    // Fetch customers from mock data for now, will be replaced with API call later
    const customers = mockCustomers;
    
    // Map to only include residential customers
    const residentialCustomers = customers.filter(customer => 
      customer.type === 'residential'
    );
    
    // Update work orders with latest customer information
    const updatedWorkOrders = workOrders.map(order => {
      const customer = residentialCustomers.find(c => c.id === order.customerId);
      if (customer) {
        return {
          ...order,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          // Use primary service address or first address in the list
          address: (customer.serviceAddresses && customer.serviceAddresses.length > 0) 
            ? (customer.serviceAddresses.find(a => a.isPrimary)?.address || customer.serviceAddresses[0].address)
            : (customer.serviceAddress || customer.address || ''),
        };
      }
      return order;
    });
    
    set({ workOrders: updatedWorkOrders });
  }
}));

// Function to get work orders from the API
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    // Attempt to fetch from Supabase
    const { data: workOrdersData, error } = await supabase.client
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching work orders from Supabase:", error);
      throw error;
    }
    
    if (!workOrdersData || workOrdersData.length === 0) {
      console.log("No work orders found in database, using mock data");
      // Use mock data filtered to only residential orders
      const residentialMockOrders = getResidentialMockWorkOrders();
      return residentialMockOrders;
    }
    
    // Only return work orders for residential customers
    const residentialWorkOrders = workOrdersData.filter(order => {
      // If we have customer info in the order, check if they're residential
      if (order.customer_type) {
        return order.customer_type === 'residential';
      }
      
      // Otherwise, we'll need to look up the customer
      return true; // We'll filter based on customer lookup later
    });
    
    return residentialWorkOrders as WorkOrder[];
  } catch (error) {
    console.error("Error in getWorkOrders:", error);
    // Fallback to mock data
    const residentialMockOrders = getResidentialMockWorkOrders();
    return residentialMockOrders;
  }
};

// Helper function to get mock work orders for residential customers only
const getResidentialMockWorkOrders = (): WorkOrder[] => {
  // Import mock data
  const { workOrders: allMockWorkOrders } = require('@/data/mockData');
  
  // Filter only residential work orders
  const residentialCustomerIds = mockCustomers
    .filter(customer => customer.type === 'residential')
    .map(customer => customer.id);
  
  return allMockWorkOrders.filter((order: WorkOrder) => 
    residentialCustomerIds.includes(order.customerId)
  );
};
