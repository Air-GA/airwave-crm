import { Technician, WorkOrder } from '@/types';

export const technicians: Technician[] = [
  {
    id: "tech-1",
    name: "Mike Johnson",
    status: "available",
    specialties: ["HVAC", "Electrical"],
    currentLocationLat: 37.7749,
    currentLocationLng: -122.4194,
    currentLocationAddress: "123 Market St, San Francisco, CA",
    email: "mike.j@example.com",
    phone: "555-1234",
    createdAt: "2023-01-15T08:00:00Z"
  },
  {
    id: "tech-2",
    name: "Sarah Williams",
    status: "busy",
    specialties: ["Plumbing", "Electrical"],
    currentLocationLat: 37.7833,
    currentLocationLng: -122.4167,
    currentLocationAddress: "456 Mission St, San Francisco, CA",
    email: "sarah.w@example.com",
    phone: "555-2345",
    createdAt: "2023-02-20T09:30:00Z"
  },
  {
    id: "tech-3",
    name: "David Chen",
    status: "off-duty",
    specialties: ["Appliance Repair", "HVAC"],
    currentLocationLat: 37.7694,
    currentLocationLng: -122.4862,
    currentLocationAddress: "789 Sunset Blvd, San Francisco, CA",
    email: "david.c@example.com",
    phone: "555-3456",
    createdAt: "2023-03-05T10:15:00Z"
  }
];

// Create mock work orders with required updatedAt property
export const workOrders: WorkOrder[] = [
  {
    id: "wo1",
    customerId: "c1",
    customerName: "John Smith",
    address: "123 Main St, Atlanta, GA 30301",
    type: "repair",
    description: "Fix leaky faucet in bathroom",
    priority: "high",
    status: "pending",
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    technicianId: "t1",
    technicianName: "John Smith",
    estimatedHours: 2,
    notes: ["Customer reports the faucet is dripping constantly"],
    progressSteps: [
      { id: "s1", label: "Diagnose issue", status: "completed" },
      { id: "s2", label: "Gather parts", status: "in-progress" },
      { id: "s3", label: "Fix faucet", status: "pending" },
      { id: "s4", label: "Test repair", status: "pending" }
    ],
    progressPercentage: 50,
    isMaintenancePlan: false,
    completionRequired: true
  },
  {
    id: "wo2",
    customerId: "c2",
    customerName: "Acme Corp",
    address: "456 Corporate Blvd, Atlanta, GA 30326",
    type: "maintenance",
    description: "Quarterly HVAC maintenance",
    priority: "medium",
    status: "scheduled",
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    technicianId: "t2",
    technicianName: "Emily Johnson",
    estimatedHours: 4,
    notes: ["Check filters, belts, and coolant levels"],
    progressSteps: [
      { id: "s5", label: "Inspect system", status: "pending" },
      { id: "s6", label: "Replace filters", status: "pending" },
      { id: "s7", label: "Check coolant", status: "pending" },
      { id: "s8", label: "Test system", status: "pending" }
    ],
    progressPercentage: 0,
    isMaintenancePlan: true,
    completionRequired: true
  }
];

// Add mock customers data
export const customers = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "404-555-1234",
    address: "123 Main St, Atlanta, GA 30301",
    billAddress: "123 Main St, Atlanta, GA 30301",
    serviceAddress: "123 Main St, Atlanta, GA 30301",
    type: "residential",
    status: "active",
    createdAt: new Date().toISOString(),
    lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "c2",
    name: "Acme Corp",
    email: "info@acmecorp.com",
    phone: "404-555-5678",
    address: "456 Corporate Blvd, Atlanta, GA 30326",
    billAddress: "456 Corporate Blvd, Atlanta, GA 30326",
    serviceAddress: "456 Corporate Blvd, Atlanta, GA 30326",
    type: "commercial",
    status: "active",
    createdAt: new Date().toISOString(),
    lastService: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Create mock data for dashboard stats and metrics
export const dashboardStats = {
  activeCustomers: 245,
  totalWorkOrders: 138,
  pendingWorkOrders: 45,
  completedWorkOrders: 93
};

export const performanceMetrics = {
  averageResolutionTime: "2.4 hours",
  customerSatisfaction: "94%",
  firstTimeFixRate: "87%",
  callbackRate: "3.2%"
};

export default { technicians, workOrders, customers, dashboardStats, performanceMetrics };
