
import { Technician, WorkOrder } from "@/types";

// Mock technicians data
export const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "John Smith",
    status: "available",
    specialties: ["HVAC", "Heating"],
    currentLocation: {
      lat: 33.7490,
      lng: -84.3880,
      address: "Atlanta, GA"
    }
  },
  {
    id: "2",
    name: "Sarah Wilson",
    status: "busy",
    specialties: ["Cooling", "Installation"],
    currentLocation: {
      lat: 33.7590,
      lng: -84.3920,
      address: "Midtown, Atlanta, GA"
    }
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
  }
];

// Mock service functions
export const fetchMockTechnicians = async (): Promise<Technician[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTechnicians;
};

export const fetchMockWorkOrders = async (): Promise<WorkOrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockWorkOrders;
};

export const updateMockWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return workOrder;
};

export const updateMockTechnician = async (technician: Technician): Promise<Technician> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return technician;
};
