export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceAddress: string;
  billAddress: string;
  type: 'residential' | 'commercial';
  status: 'active' | 'inactive';
  createdAt: string;
  lastService: string;
  serviceAddresses?: ServiceAddress[];
}

export interface ServiceAddress {
  id: string;
  address: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  type: 'repair' | 'maintenance' | 'installation' | 'inspection';
  description: string;
  scheduledDate: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  completedAt?: string;
  partsUsed?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  email?: string;
  phoneNumber?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  supplier: string;
  location: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  status: 'available' | 'busy' | 'off-duty';
}

// Mock customers data with serviceAddresses
export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '404-555-1234',
    address: '123 Main St, Atlanta, GA 30301',
    serviceAddress: '123 Main St, Atlanta, GA 30301',
    billAddress: '123 Main St, Atlanta, GA 30301',
    type: 'residential',
    status: 'active',
    createdAt: '2025-02-15T14:22:00Z',
    lastService: '2025-03-10T09:30:00Z',
    serviceAddresses: [
      {
        id: 'sa1',
        address: '123 Main St, Atlanta, GA 30301',
        isPrimary: true,
        notes: 'Primary residence'
      }
    ]
  },
  {
    id: 'c3',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '404-555-3456',
    address: '456 Oak Dr, Marietta, GA 30060',
    serviceAddress: '456 Oak Dr, Marietta, GA 30060',
    billAddress: '456 Oak Dr, Marietta, GA 30060',
    type: 'residential',
    status: 'active',
    createdAt: '2025-02-05T09:30:00Z',
    lastService: '2025-04-15T11:20:00Z',
    serviceAddresses: [
      {
        id: 'sa4',
        address: '456 Oak Dr, Marietta, GA 30060',
        isPrimary: true,
        notes: 'Home address'
      }
    ]
  },
  {
    id: 'c5',
    name: 'Thomas Family',
    email: 'thomasfamily@outlook.com',
    phone: '770-555-7890',
    address: '789 Pine Road, Alpharetta, GA',
    serviceAddress: '789 Pine Road, Alpharetta, GA',
    billAddress: '789 Pine Road, Alpharetta, GA',
    type: 'residential',
    status: 'active',
    createdAt: '2025-02-20T11:10:00Z',
    lastService: '2025-04-25T10:15:00Z',
    serviceAddresses: [
      {
        id: 'sa7',
        address: '789 Pine Road, Alpharetta, GA',
        isPrimary: true,
        notes: 'Beware of dog'
      }
    ]
  },
  {
    id: 'c4',
    name: 'Robert Matthews',
    email: 'robert@example.com',
    phone: '404-555-4567',
    address: '1100 Peachtree St NE, Atlanta, GA 30309',
    serviceAddress: '1100 Peachtree St NE, Atlanta, GA 30309',
    billAddress: '1100 Peachtree St NE, Suite 200, Atlanta, GA 30309',
    type: 'residential',
    status: 'active',
    createdAt: '2025-01-11T08:45:00Z',
    lastService: '2025-05-01T15:30:00Z',
    serviceAddresses: [
      {
        id: 'sa5',
        address: '1100 Peachtree St NE, Atlanta, GA 30309',
        isPrimary: true
      },
      {
        id: 'sa6',
        address: '1120 Peachtree St NE, Atlanta, GA 30309',
        isPrimary: false,
        notes: 'Vacation Home'
      }
    ]
  },
  {
    id: 'c2',
    name: 'Michael Williams',
    email: 'michael.w@example.com',
    phone: '404-555-5678',
    address: '789 Elm Street, Roswell, GA 30075',
    serviceAddress: '789 Elm Street, Roswell, GA 30075',
    billAddress: '789 Elm Street, Roswell, GA 30075',
    type: 'residential',
    status: 'active',
    createdAt: '2025-02-20T11:10:00Z',
    lastService: '2025-04-25T10:15:00Z',
    serviceAddresses: [
      {
        id: 'sa2',
        address: '789 Elm Street, Roswell, GA 30075',
        isPrimary: true
      }
    ]
  }
];

// Mock work orders data
export const workOrders: WorkOrder[] = [
  {
    id: 'wo1',
    customerId: 'c1',
    customerName: 'John Smith',
    address: '123 Main St, Atlanta, GA 30301',
    status: 'scheduled',
    priority: 'medium',
    type: 'repair',
    description: 'AC not cooling properly, possible refrigerant leak',
    scheduledDate: '2025-04-18T09:00:00Z',
    technicianId: 't1',
    technicianName: 'David Martinez',
    createdAt: '2025-04-15T13:25:00Z'
  },
  {
    id: 'wo2',
    customerId: 'c2',
    customerName: 'Technical College',
    address: '225 North Ave NW, Atlanta, GA 30332',
    status: 'in-progress',
    priority: 'high',
    type: 'maintenance',
    description: 'Quarterly maintenance for campus HVAC systems - Building A',
    scheduledDate: '2025-04-17T08:00:00Z',
    technicianId: 't2',
    technicianName: 'Lisa Wong',
    createdAt: '2025-04-10T09:15:00Z'
  },
  {
    id: 'wo3',
    customerId: 'c3',
    customerName: 'Sarah Johnson',
    address: '456 Oak Dr, Marietta, GA 30060',
    status: 'pending',
    priority: 'low',
    type: 'inspection',
    description: 'Annual HVAC system inspection',
    scheduledDate: '2025-04-22T13:30:00Z',
    createdAt: '2025-04-16T14:20:00Z'
  },
  {
    id: 'wo4',
    customerId: 'c4',
    customerName: 'Robert Matthews',
    address: '1100 Peachtree St NE, Atlanta, GA 30309',
    status: 'completed',
    priority: 'medium',
    type: 'repair',
    description: 'Fix thermostat issues on 3rd floor',
    scheduledDate: '2025-04-15T10:00:00Z',
    technicianId: 't3',
    technicianName: 'James Wilson',
    createdAt: '2025-04-12T11:30:00Z',
    completedAt: '2025-04-15T12:45:00Z',
    partsUsed: [
      {
        id: 'p1',
        name: 'Digital Thermostat',
        quantity: 1,
        price: 129.99
      },
      {
        id: 'p2',
        name: 'Wiring Kit',
        quantity: 1,
        price: 24.50
      }
    ]
  },
  {
    id: 'wo5',
    customerId: 'c5',
    customerName: 'Michael Williams',
    address: '789 Elm Street, Roswell, GA 30075',
    status: 'scheduled',
    priority: 'emergency',
    type: 'repair',
    description: 'Furnace not working, no heat in house',
    scheduledDate: '2025-04-17T15:00:00Z',
    technicianId: 't4',
    technicianName: 'Robert Johnson',
    createdAt: '2025-04-16T20:10:00Z'
  }
];

// Mock inventory items
export const inventory: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Air Filter - MERV 13',
    category: 'Filters',
    description: '20x20x1 High-Efficiency Air Filter',
    quantity: 45,
    price: 19.99,
    reorderLevel: 20,
    supplier: 'FilterCo',
    location: 'Warehouse A, Shelf 3'
  },
  {
    id: 'i2',
    name: 'Refrigerant R-410A',
    category: 'Chemicals',
    description: 'EPA-approved AC refrigerant, 25lb cylinder',
    quantity: 8,
    price: 189.50,
    reorderLevel: 5,
    supplier: 'CoolChem',
    location: 'Warehouse A, Safety Cabinet'
  },
  {
    id: 'i3',
    name: 'Digital Thermostat',
    category: 'Controls',
    description: 'Wi-Fi Enabled Programmable Thermostat',
    quantity: 12,
    price: 129.99,
    reorderLevel: 10,
    supplier: 'TechTemp',
    location: 'Warehouse B, Shelf 1'
  },
  {
    id: 'i4',
    name: 'Capacitor 45/5 MFD',
    category: 'Electrical',
    description: 'Dual Run Capacitor 45/5 MFD 440V',
    quantity: 18,
    price: 32.75,
    reorderLevel: 15,
    supplier: 'ElectroParts',
    location: 'Warehouse A, Shelf 5'
  },
  {
    id: 'i5',
    name: 'Condensing Fan Motor',
    category: 'Motors',
    description: '1/4 HP Condenser Fan Motor 208-230V',
    quantity: 7,
    price: 145.00,
    reorderLevel: 5,
    supplier: 'MotorMax',
    location: 'Warehouse B, Shelf 4'
  }
];

// Mock technicians data
export const technicians: Technician[] = [
  {
    id: 't1',
    name: 'David Martinez',
    email: 'david.m@airga.com',
    phone: '404-555-7890',
    specialties: ['AC Repair', 'Installation'],
    currentLocation: {
      lat: 33.7851,
      lng: -84.3856,
      address: '285 Peachtree Center Ave, Atlanta, GA 30303',
      timestamp: '2025-04-17T08:35:00Z'
    },
    status: 'busy'
  },
  {
    id: 't2',
    name: 'Lisa Wong',
    email: 'lisa.w@airga.com',
    phone: '404-555-8901',
    specialties: ['Commercial HVAC', 'Maintenance'],
    currentLocation: {
      lat: 33.9277,
      lng: -84.3370,
      address: '225 North Ave NW, Atlanta, GA 30332',
      timestamp: '2025-04-17T08:30:00Z'
    },
    status: 'busy'
  },
  {
    id: 't3',
    name: 'James Wilson',
    email: 'james.w@airga.com',
    phone: '404-555-9012',
    specialties: ['Controls', 'Electrical'],
    currentLocation: {
      lat: 33.8312,
      lng: -84.3615,
      address: '1380 Atlantic Dr NW, Atlanta, GA 30363',
      timestamp: '2025-04-17T08:40:00Z'
    },
    status: 'available'
  },
  {
    id: 't4',
    name: 'Robert Johnson',
    email: 'robert.j@airga.com',
    phone: '404-555-0123',
    specialties: ['Residential HVAC', 'Furnace Repair'],
    currentLocation: {
      lat: 33.7490,
      lng: -84.3880,
      address: '125 Auburn Ave NE, Atlanta, GA 30303',
      timestamp: '2025-04-17T08:25:00Z'
    },
    status: 'available'
  },
  {
    id: 't5',
    name: 'Maria Garcia',
    email: 'maria.g@airga.com',
    phone: '404-555-1234',
    specialties: ['Ductwork', 'Air Quality'],
    currentLocation: {
      lat: 33.8602,
      lng: -84.4641,
      address: '4400 Ashford Dunwoody Rd, Atlanta, GA 30346',
      timestamp: '2025-04-17T08:15:00Z'
    },
    status: 'off-duty'
  }
];

// Dashboard statistics
export const dashboardStats = {
  totalWorkOrders: 27,
  pendingWorkOrders: 8,
  inProgressWorkOrders: 11,
  completedWorkOrdersThisWeek: 18,
  totalCustomers: 134,
  revenueThisMonth: 65420.75,
  averageCompletionTime: '3.2 hours',
  inventoryAlerts: 3
};

// Performance metrics
export const performanceMetrics = [
  { date: '2025-04-11', completedJobs: 7, revenue: 4250.50 },
  { date: '2025-04-12', completedJobs: 6, revenue: 3920.75 },
  { date: '2025-04-13', completedJobs: 4, revenue: 2150.25 },
  { date: '2025-04-14', completedJobs: 2, revenue: 1560.00 },
  { date: '2025-04-15', completedJobs: 8, revenue: 5430.80 },
  { date: '2025-04-16', completedJobs: 7, revenue: 4875.50 },
  { date: '2025-04-17', completedJobs: 5, revenue: 3245.60 }
];

export const staticCustomers = customers;
