
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceAddresses?: ServiceAddress[]; // Changed to optional with ?
  billAddress: string;
  notes?: string;
  type?: 'residential' | 'commercial';
  createdAt?: string;
  lastService?: string;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  serviceAddress?: string; // Maintained for backward compatibility
  maintenancePlan?: 'biannual' | 'quarterly' | 'annual' | null;
  maintenanceTimePreference?: string;
  nextMaintenanceDate?: string;
}

export interface ServiceAddress {
  id: string;
  address: string;
  isPrimary?: boolean;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Technician {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off-duty';
  specialties: string[];
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface WorkOrder {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  type: 'repair' | 'maintenance' | 'installation' | 'inspection';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'pending-completion' | 'cancelled';
  scheduledDate: string;
  createdAt: string;
  completedDate?: string;
  estimatedHours?: number;
  technicianId?: string;
  technicianName?: string;
  notes?: string[];
  pendingReason?: string;
  completionRequired?: boolean;
  completedAt?: string;
  partsUsed?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  // Add these fields to support customer creation from work orders
  email?: string;
  phoneNumber?: string;
  // Add maintenance plan related fields
  isMaintenancePlan?: boolean;
  maintenanceTimePreference?: string;
  nearbyAddresses?: string[];
  // Syncing information
  syncedFromCRM?: boolean;
  syncTimestamp?: string;
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
  sku?: string;
  unit_price?: number;
}
