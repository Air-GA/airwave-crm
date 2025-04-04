import { Technician, WorkOrder } from "@/types";

// Mock technicians data
export const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "John Smith",
    status: "available",
    specialties: ["HVAC", "Heating"],
    current_location_lat: 33.7490,
    current_location_lng: -84.3880,
    current_location_address: "Atlanta, GA"
  },
  {
    id: "2",
    name: "Sarah Wilson",
    status: "busy",
    specialties: ["Cooling", "Installation"],
    current_location_lat: 33.7590,
    current_location_lng: -84.3920,
    current_location_address: "Midtown, Atlanta, GA"
  }
];

// Mock work orders data
export const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo1",
    customerId: "cust1",
    customerName: "John Doe",
    address: "123 Main St, Atlanta, GA",
    type: "repair",
    description: "AC not cooling",
    priority: "high",
    status: "pending",
    scheduledDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    technicianId: "1",
    technicianName: "John Smith",
    estimatedHours: 2,
    notes: ["Customer reported loud noise", "Unit is 5 years old"]
  },
  {
    id: "wo2",
    customerId: "cust2",
    customerName: "Jane Smith",
    address: "456 Oak Dr, Atlanta, GA",
    type: "maintenance",
    description: "Annual maintenance checkup",
    priority: "low",
    status: "scheduled",
    scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    technicianId: "2",
    technicianName: "Sarah Wilson",
    estimatedHours: 1,
    notes: ["Regular maintenance"]
  },
  {
    id: "wo3",
    customerId: "cust3",
    customerName: "Robert Johnson",
    address: "789 Pine Ave, Atlanta, GA",
    type: "repair",
    description: "Heater not working",
    priority: "medium",
    status: "pending-completion",
    scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    technicianId: "1",
    technicianName: "John Smith",
    estimatedHours: 3,
    notes: ["Customer complained of no heat", "Need to order parts"],
    pendingReason: "Waiting for parts to arrive"
  },
  {
    id: "wo4",
    customerId: "cust4",
    customerName: "Emily Davis",
    address: "123 Maple St, Atlanta, GA",
    type: "installation",
    description: "New AC unit installation",
    priority: "high",
    status: "completed",
    scheduledDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    completedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    technicianId: "2",
    technicianName: "Sarah Wilson",
    estimatedHours: 4,
    notes: ["Installation completed successfully"]
  }
];

// Mock service functions
export const fetchMockTechnicians = async (): Promise<Technician[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTechnicians;
};

export const fetchMockWorkOrders = async (): Promise<WorkOrder[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get work orders from localStorage if they exist, otherwise use mock data
  const storedOrders = localStorage.getItem('mockWorkOrders');
  if (storedOrders) {
    try {
      const parsedOrders = JSON.parse(storedOrders);
      if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
        return parsedOrders;
      }
    } catch (error) {
      console.error("Error parsing stored work orders:", error);
    }
  }
  return mockWorkOrders;
};

export const updateMockWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get existing orders
  const storedOrders = localStorage.getItem('mockWorkOrders');
  let orders = [];
  
  if (storedOrders) {
    try {
      orders = JSON.parse(storedOrders);
    } catch (error) {
      orders = [...mockWorkOrders];
    }
  } else {
    orders = [...mockWorkOrders];
  }
  
  // Update the order in the array
  const updatedOrders = orders.map(order => 
    order.id === workOrder.id ? workOrder : order
  );
  
  // Save back to localStorage
  localStorage.setItem('mockWorkOrders', JSON.stringify(updatedOrders));
  
  return workOrder;
};

export const updateMockTechnician = async (technician: Technician): Promise<Technician> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return technician;
};

export const completeMockWorkOrder = async (
  workOrderId: string, 
  notes?: string
): Promise<WorkOrder> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get existing orders
  const storedOrders = localStorage.getItem('mockWorkOrders');
  let orders = [];
  
  if (storedOrders) {
    try {
      orders = JSON.parse(storedOrders);
    } catch (error) {
      orders = [...mockWorkOrders];
    }
  } else {
    orders = [...mockWorkOrders];
  }
  
  // Find the work order
  const workOrder = orders.find(order => order.id === workOrderId);
  if (!workOrder) throw new Error("Work order not found");
  
  const updatedOrder: WorkOrder = {
    ...workOrder,
    status: "completed",
    completedDate: new Date().toISOString(),
    notes: notes ? [...(workOrder.notes || []), notes] : workOrder.notes
  };
  
  // Update the order in the array
  const updatedOrders = orders.map(order => 
    order.id === workOrderId ? updatedOrder : order
  );
  
  // Save back to localStorage
  localStorage.setItem('mockWorkOrders', JSON.stringify(updatedOrders));
  
  return updatedOrder;
};

export const markWorkOrderPendingCompletion = async (
  workOrderId: string,
  pendingReason: string
): Promise<WorkOrder> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get existing orders
  const storedOrders = localStorage.getItem('mockWorkOrders');
  let orders = [];
  
  if (storedOrders) {
    try {
      orders = JSON.parse(storedOrders);
    } catch (error) {
      orders = [...mockWorkOrders];
    }
  } else {
    orders = [...mockWorkOrders];
  }
  
  // Find the work order
  const workOrder = orders.find(order => order.id === workOrderId);
  if (!workOrder) throw new Error("Work order not found");
  
  const updatedOrder: WorkOrder = {
    ...workOrder,
    status: "pending-completion",
    pendingReason: pendingReason
  };
  
  // Update the order in the array
  const updatedOrders = orders.map(order => 
    order.id === workOrderId ? updatedOrder : order
  );
  
  // Save back to localStorage
  localStorage.setItem('mockWorkOrders', JSON.stringify(updatedOrders));
  
  return updatedOrder;
};

// Mock function to create a work order
export const createMockWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  // Simulate API delay  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get existing orders
  const storedOrders = localStorage.getItem('mockWorkOrders');
  let orders = [];
  
  if (storedOrders) {
    try {
      orders = JSON.parse(storedOrders);
    } catch (error) {
      orders = [...mockWorkOrders];
    }
  } else {
    orders = [...mockWorkOrders];
  }
  
  // Add the new work order
  const updatedOrders = [...orders, workOrder];
  
  // Save back to localStorage
  localStorage.setItem('mockWorkOrders', JSON.stringify(updatedOrders));
  
  return workOrder;
};
