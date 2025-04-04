
export interface Technician {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off-duty';
  specialties?: string[];
  current_location_lat?: number;
  current_location_lng?: number;
  current_location_address?: string;
}

export interface WorkOrder {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  type: 'installation' | 'maintenance' | 'repair' | 'inspection';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'scheduled' | 'in-progress' | 'pending-completion' | 'completed' | 'cancelled';
  scheduledDate: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  completedAt?: string;
  completedDate?: string;
  pendingReason?: string;
  notes?: string[];
  partsUsed?: Array<{
    id: string;
    name: string;
    quantity: number;
    cost: number;
  }>;
  estimatedHours?: number;
  phoneNumber?: string;
  email?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceAddress?: string;
  billAddress?: string;
  type: 'residential' | 'commercial' | 'industrial';
  createdAt: string;
  serviceAddresses?: ServiceAddress[];
  maintenancePlan?: {
    active: boolean;
    type: 'biannual' | 'annual' | 'quarterly';
    nextServiceDate?: string;
    preferredTimeSlot?: string;
  };
}

export interface ServiceAddress {
  id: string;
  address: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  price: number;
  cost?: number;
  reorderLevel: number;
  supplier?: string;
  location?: string;
  sku?: string;
  unit_price?: number;
}
