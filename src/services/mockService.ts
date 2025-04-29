import { Customer, Technician, WorkOrder } from "@/types";

export const getMockTechnicians = (): Technician[] => {
  return [
    {
      id: "t1",
      name: "John Smith",
      status: "available",
      specialties: ["HVAC", "Plumbing"],
      currentLocation: {
        lat: 33.749,
        lng: -84.388,
        address: "Atlanta, GA"
      },
      createdAt: new Date().toISOString() // Add createdAt property
    },
    {
      id: "t2", 
      name: "Emily Johnson",
      status: "busy",
      specialties: ["Electrical", "HVAC"],
      currentLocation: {
        lat: 33.748,
        lng: -84.387,
        address: "Downtown Atlanta, GA"
      },
      createdAt: new Date().toISOString() // Add createdAt property
    },
    {
      id: "t3",
      name: "David Lee",
      status: "off-duty",
      specialties: ["Plumbing", "General Repair"],
      currentLocation: {
        lat: 33.747,
        lng: -84.386,
        address: "Midtown Atlanta, GA"
      },
      createdAt: new Date().toISOString() // Add createdAt property
    },
    {
      id: "t4",
      name: "Ashley Green",
      status: "available",
      specialties: ["HVAC", "Electrical"],
      currentLocation: {
        lat: 33.746,
        lng: -84.385,
        address: "Buckhead, GA"
      },
      createdAt: new Date().toISOString() // Add createdAt property
    },
    {
      id: "t5",
      name: "Kevin Brown",
      status: "busy",
      specialties: ["General Repair"],
      currentLocation: {
        lat: 33.745,
        lng: -84.384,
        address: "Decatur, GA"
      },
      createdAt: new Date().toISOString() // Add createdAt property
    }
  ];
};

export const getMockCustomers = (): Customer[] => {
  return [
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
    },
    {
      id: "c3",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "404-555-3456",
      address: "456 Oak Dr, Marietta, GA 30060",
      billAddress: "456 Oak Dr, Marietta, GA 30060",
      serviceAddress: "456 Oak Dr, Marietta, GA 30060",
      type: "residential",
      status: "active",
      createdAt: new Date().toISOString(),
      lastService: null
    },
    {
      id: "c4",
      name: "GlobalTech Solutions",
      email: "contact@globaltech.com",
      phone: "770-555-9012",
      address: "789 Tech Pkwy, Roswell, GA 30076",
      billAddress: "789 Tech Pkwy, Roswell, GA 30076",
      serviceAddress: "789 Tech Pkwy, Roswell, GA 30076",
      type: "commercial",
      status: "inactive",
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "c5",
      name: "Thomas Family",
      email: "thomasfamily@outlook.com",
      phone: "770-555-7890",
      address: "789 Pine Road, Alpharetta, GA",
      billAddress: "789 Pine Road, Alpharetta, GA",
      serviceAddress: "789 Pine Road, Alpharetta, GA",
      type: "residential",
      status: "active",
      createdAt: new Date().toISOString(),
      lastService: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const getMockWorkOrders = (): WorkOrder[] => {
  return [
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
    },
    {
      id: "wo3",
      customerId: "c3",
      customerName: "Sarah Johnson",
      address: "456 Oak Dr, Marietta, GA 30060",
      type: "installation",
      description: "Install new smart thermostat",
      priority: "high",
      status: "in-progress",
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      technicianId: "t1",
      technicianName: "John Smith",
      estimatedHours: 3,
      notes: ["Customer wants to integrate with existing smart home system"],
      progressSteps: [
        { id: "s9", label: "Remove old thermostat", status: "completed" },
        { id: "s10", label: "Install new thermostat", status: "in-progress" },
        { id: "s11", label: "Connect to Wi-Fi", status: "pending" },
        { id: "s12", label: "Test system", status: "pending" }
      ],
      progressPercentage: 75,
      isMaintenancePlan: false,
      completionRequired: true
    },
    {
      id: "wo4",
      customerId: "c4",
      customerName: "GlobalTech Solutions",
      address: "789 Tech Pkwy, Roswell, GA 30076",
      type: "inspection",
      description: "Annual electrical inspection",
      priority: "medium",
      status: "completed",
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      technicianId: "t4",
      technicianName: "Ashley Green",
      estimatedHours: 5,
      notes: ["Check all outlets, wiring, and panels"],
      progressSteps: [
        { id: "s13", label: "Inspect outlets", status: "completed" },
        { id: "s14", label: "Check wiring", status: "completed" },
        { id: "s15", label: "Inspect panels", status: "completed" },
        { id: "s16", label: "Submit report", status: "completed" }
      ],
      progressPercentage: 100,
      isMaintenancePlan: true,
      completionRequired: true
    },
    {
      id: "wo5",
      customerId: "c5",
      customerName: "Thomas Family",
      address: "789 Pine Road, Alpharetta, GA",
      type: "repair",
      description: "Repair broken sprinkler system",
      priority: "high",
      status: "cancelled",
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      technicianId: "t3",
      technicianName: "David Lee",
      estimatedHours: 3,
      notes: ["Customer reports several broken sprinkler heads"],
      progressSteps: [
        { id: "s17", label: "Diagnose issue", status: "completed" },
        { id: "s18", label: "Gather parts", status: "cancelled" },
        { id: "s19", label: "Replace heads", status: "cancelled" },
        { id: "s20", label: "Test system", status: "cancelled" }
      ],
      progressPercentage: 25,
      isMaintenancePlan: false,
      completionRequired: true
    }
  ];
};
