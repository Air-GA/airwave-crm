
export interface ServiceAddress {
  id: string;
  address: string;
  isPrimary: boolean;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billAddress?: string;
  billCity?: string;  
  serviceAddress?: string;
  serviceAddresses?: ServiceAddress[];
  type: 'residential' | 'commercial';
  status: 'active' | 'inactive' | 'pending' | 'new';
  createdAt: string;
  lastService?: string;
}

// Updated Technician interface to include currentLocation
export interface Technician {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off-duty';
  specialties?: string[];
  currentLocationAddress?: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  // This is needed for backwards compatibility
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  email?: string;
  phone?: string;
  createdAt: string;
}

// Updated ProgressStep interface to include all required properties
export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  timestamp?: string;
  notes?: string;
  // Add properties used in WorkOrderProgressTracker
  name?: string;
  description?: string;
  notifyCustomer?: boolean;
  notifyTech?: boolean;
  notifyAdmin?: boolean;
}

// Updated WorkOrder interface to include all required properties
export interface WorkOrder {
  id: string;
  customerName: string;
  customerId: string;
  address: string;
  type: 'repair' | 'maintenance' | 'installation' | 'inspection';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending-completion';
  scheduledDate: string;
  createdAt: string;
  updatedAt: string; // Changed to non-optional
  completedDate?: string;
  estimatedHours?: number;
  technicianId?: string;
  technicianName?: string;
  notes?: string[];
  progressSteps?: ProgressStep[];
  progressPercentage?: number;
  pendingReason?: string;
  // Additional fields used in the app
  isMaintenancePlan?: boolean;
  maintenancePlanId?: string; // Added this field
  currentProgressStep?: string;
  email?: string;
  phoneNumber?: string;
  estimatedArrivalTime?: string;
  partsUsed?: any[];
  completionRequired?: boolean;
  completionDetails?: any;
  serviceAddressId?: string; // Added this field to fix type errors
}
