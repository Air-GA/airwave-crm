
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

// Add the missing types that are causing errors
export interface Technician {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off-duty';
  specialties?: string[];
  currentLocationAddress?: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  createdAt: string;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  timestamp?: string;
  notes?: string;
}

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
  completedDate?: string;
  estimatedHours?: number;
  technicianId?: string;
  technicianName?: string;
  notes?: string[];
  progressSteps?: ProgressStep[];
  progressPercentage?: number;
  pendingReason?: string;
}
